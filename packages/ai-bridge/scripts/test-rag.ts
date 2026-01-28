import { RAGService } from '../src/rag-service'; // Adjust path if needed, or use built dist

// @ts-ignore
const apiKey = process.env.GEMINI_API_KEY || "dummy_key";

async function testRAG() {
    console.log("Initializing RAG Service...");
    const rag = new RAGService(apiKey);

    console.log("Testing Embedding Generation...");
    try {
        const embedding = await rag.generateEmbedding("Hello world");
        console.log(`Embedding generated. Length: ${embedding.length}`);
        if (embedding.length === 384) {
            console.log("SUCCESS: 384-dim vector produced.");
        } else {
            console.error(`FAILURE: Expected 384 dimensions, got ${embedding.length}`);
        }
    } catch (e) {
        console.error("Embedding generation failed:", e);
    }
}

testRAG();
