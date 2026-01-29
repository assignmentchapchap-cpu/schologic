import { pipeline } from '@xenova/transformers';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Types
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface SearchResult {
    id: string;
    content: string;
    similarity: number;
    metadata?: any;
}

// Environment variables must be passed or accessed from process.env
// We assume they are available in the server environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY!;

export class RagService {
    private static instance: RagService;
    private extractor: any = null;
    private supabase;
    private genAI;

    private constructor() {
        if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
            console.warn("RagService: Missing Supabase credentials");
        }
        this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        if (!GEMINI_API_KEY) {
            console.warn("RagService: Missing Gemini API Key");
        }
        this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }

    public static getInstance(): RagService {
        if (!RagService.instance) {
            RagService.instance = new RagService();
        }
        return RagService.instance;
    }

    /**
     * Lazy load the embedding model to avoid startup costs if not used.
     * Uses 'Supabase/gte-small' from Xenova (quantized).
     */
    private async getExtractor() {
        if (!this.extractor) {
            console.log("RagService: Loading embedding model (Supabase/gte-small)...");
            // Use a specific revision or default
            this.extractor = await pipeline('feature-extraction', 'Supabase/gte-small');
        }
        return this.extractor;
    }

    /**
     * Generate embedding for a query string.
     */
    public async generateEmbedding(text: string): Promise<number[]> {
        const extractor = await this.getExtractor();
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }

    /**
     * Search the 'embeddings' table in Supabase for similar content.
     */
    public async search(query: string, matchThreshold = 0.7, matchCount = 5): Promise<SearchResult[]> {
        try {
            const embedding = await this.generateEmbedding(query);

            const { data: chunks, error } = await this.supabase.rpc('match_embeddings', {
                query_embedding: embedding,
                match_threshold: matchThreshold,
                match_count: matchCount,
            });

            if (error) {
                console.error("Supabase vector search error:", error);
                throw error;
            }

            return chunks.map((chunk: any) => ({
                id: chunk.id,
                content: chunk.content,
                similarity: chunk.similarity,
                metadata: chunk.metadata || {}
            }));

        } catch (error) {
            console.error("Search failed:", error);
            return [];
        }
    }

    /**
     * Chat with the LLM using retrieved context.
     * Returns a stream of text.
     */
    public async chatStream(
        message: string,
        history: ChatMessage[] = [],
        contextChunks: SearchResult[] = []
    ) {
        // 1. Build Context String
        const contextText = contextChunks
            .map(c => `[Context from ${c.metadata?.source || 'doc'}]: ${c.content}`)
            .join('\n\n');

        // 2. System Prompt
        const systemPrompt = `You are a helpful, professional AI assistant for the Schologic LMS platform.
Use the following context to answer the user's question. if the answer is not in the context, say so politely or try to answer from general knowledge if it is a general question, but prioritize the context.
Do not invent facts about the system that are not in the context.

CONTEXT:
${contextText}
`;

        // 3. Construct Gemini History
        // Gemini expects { role: 'user' | 'model', parts: [{ text: ... }] }
        // We put the system prompt + context in the FIRST user message or treat it as instructions.
        // Google Generative AI supports system instructions in the model config now, or we can prepend.

        // Simple approach: Prepend context to the latest message or system instruction
        const model = this.genAI.getGenerativeModel({
            model: "gemini-pro",
            systemInstruction: systemPrompt
        });

        const chat = model.startChat({
            history: history.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            })),
            generationConfig: {
                maxOutputTokens: 1000,
            }
        });

        const result = await chat.sendMessageStream(message);
        return result.stream;
    }
}
