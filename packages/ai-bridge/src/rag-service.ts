import { env } from "@xenova/transformers";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Configure cache for Vercel/Serverless
env.cacheDir = '/tmp/.cache';
env.allowLocalModels = false; // Force download in serverless
env.useBrowserCache = false;

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
        const prompt = `You are a customer representative for Schologic LMS. 
Answer the user's question based on the following context. 
Use inclusive, personalized language such as "we", "our platform", or "you can" instead of "the documentation says". 
Make the user feel like they are talking to a knowledgeable team member.
If the answer is not in the context, safely say you don't know.

When recommending actions, provide internal links to the relevant pages using markdown [Link Text](/path).
Use this Site Map:
- Dashboard: /instructor/dashboard
- Classes: /instructor/classes
- Create Assignment: /instructor/class/[classId]?tab=assignments (ask user for class context if needed or link to generic classes)
- Rubrics: /instructor/rubrics
- Library: /instructor/library
- Settings: /instructor/settings

Context:

${context}

Question: 
${question}

Answer:`;

        const result = await this.model.generateContentStream(prompt);
        return result.stream;
    }
}
