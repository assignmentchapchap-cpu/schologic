import { GoogleGenerativeAI } from "@google/generative-ai";
// @ts-ignore - types might be missing or require specific setup
import { pipeline } from "@xenova/transformers";

// Singleton to hold the pipeline instance
let embeddingPipeline: any = null;

export class RAGService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error("API Key is required for RAGService");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        // User requested "gemini 2.5 flash lite"
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    }

    /**
     * Generates a 384-dimensional embedding for the given text using gte-small.
     */
    async generateEmbedding(text: string): Promise<number[]> {
        if (!embeddingPipeline) {
            // Use Xenova/gte-small which is the standard quantized version for transformers.js
            embeddingPipeline = await pipeline('feature-extraction', 'Xenova/gte-small');
        }

        // Clean text
        const cleanText = text.replace(/\n/g, ' ').trim();

        // Generate embedding
        // pooling: 'mean' and normalize: true are standard for GTE 
        const output = await embeddingPipeline(cleanText, { pooling: 'mean', normalize: true });

        return Array.from(output.data);
    }

    /**
     * Generates an answer using Gemini based on the provided context and question.
     */
    async generateAnswerStream(context: string, question: string) {
        const prompt = `You are a helpful teaching assistant for the Schologic LMS. 
Answer the user's question based ONLY on the following context from the documentation. 
If the answer is not in the context, say you don't know or ask for clarification.

Context:
${context}

Question: 
${question}

Answer:`;

        const result = await this.model.generateContentStream(prompt);
        return result.stream;
    }
}
