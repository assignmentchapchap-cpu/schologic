import { pipeline, env } from '@xenova/transformers';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Configure transformers for Vercel (Read-only filesystem)
env.allowLocalModels = false;
env.cacheDir = '/tmp';

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
const OPEN_ROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY!;

console.log("RagService: Initializing with Supabase URL:", SUPABASE_URL?.split('//')[1]?.split('.')[0] || 'MISSING');
console.log("RagService: OpenRouter API Key configured:", !!OPEN_ROUTER_API_KEY);

export class RagService {
    private static instance: RagService;
    private extractor: any = null;
    private supabase;
    private openai;

    private constructor() {
        if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
            console.warn("RagService: Missing Supabase credentials");
        }
        this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        if (!OPEN_ROUTER_API_KEY) {
            console.warn("RagService: Missing OpenRouter API Key");
        }
        this.openai = new OpenAI({
            apiKey: OPEN_ROUTER_API_KEY,
            baseURL: 'https://openrouter.ai/api/v1',
            defaultHeaders: {
                'HTTP-Referer': 'https://schologic.com',
                'X-Title': 'Schologic',
            }
        });
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

            const { data: chunks, error } = await this.supabase.rpc('match_kb_documents', {
                query_embedding: JSON.stringify(embedding), // Ensure it's stringyfied if types say string, or just embedding
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

Always format your response using clear Markdown including bolding, lists, and headers where appropriate for readability.
When referring to specific features or sections of the platform, always include a Markdown link using the following internal routes where possible:
- Dashboard: [/instructor/dashboard](/instructor/dashboard) or [/student/dashboard](/student/dashboard)
- Classes: [/instructor/classes](/instructor/classes) or [/student/classes](/student/classes)
- Submissions/Grading: [/instructor/class/CLASS_ID?tab=assignments](/instructor/class/...id...?tab=assignments)
- Resources/Materials: [/instructor/class/CLASS_ID?tab=resources](/instructor/class/...id...?tab=resources) or [/instructor/library](/instructor/library)
- Student Roster: [/instructor/class/CLASS_ID?tab=students](/instructor/class/...id...?tab=students)
- AI Lab: [/instructor/lab](/instructor/lab)
- Performance/Grades: [/instructor/performance](/instructor/performance) or [/student/grades](/student/grades)
- Settings: [/instructor/settings](/instructor/settings)
- Profile: [/instructor/profile](/instructor/profile)

Note: When linking to a specific class page with a tab, if you don't know the exact class ID, use a placeholder or link to the main classes page.

CONTEXT:
${contextText}
`;

        const openaiHistory: any[] = history.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : msg.role,
            content: msg.content
        }));

        const modelName = process.env.CHAT_MODEL || "mistralai/mistral-small-3.1-24b-instruct:free";

        const response = await this.openai.chat.completions.create({
            model: modelName,
            messages: [
                { role: 'system', content: systemPrompt },
                ...openaiHistory,
                { role: 'user', content: message }
            ],
            stream: true,
        });

        return response;
    }
}
