import { createSessionClient } from "@schologic/database/server";
import { RAGService } from "@schologic/ai-bridge";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);

        // 1. Auth Guard
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Role check (assuming role is in user_metadata or you have a profile table check)
        // For now, checking metadata based on user request "instructors only"
        const role = user.user_metadata?.role;
        if (role !== 'instructor') {
            return new NextResponse("Forbidden: Instructors only", { status: 403 });
        }

        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1];
        const userQuestion = lastMessage.content;

        // 2. Initialize RAG Service
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Missing GEMINI_API_KEY");
            return new NextResponse("Server Configuration Error", { status: 500 });
        }
        const ragService = new RAGService(apiKey);

        // 3. Generate Embedding
        const embedding = await ragService.generateEmbedding(userQuestion);

        // 4. Retrieve Context via RPC
        const { data: documents, error: searchError } = await supabase.rpc('match_kb_documents', {
            query_embedding: JSON.stringify(embedding),
            match_threshold: 0.5, // Adjustable
            match_count: 5
        });

        if (searchError) {
            console.error("Vector search error:", searchError);
            return new NextResponse("Database Search Error", { status: 500 });
        }

        const context = documents?.map((doc: any) => doc.content).join("\n---\n") || "";

        // 5. Generate Answer Stream
        // We use a simple stream response here. 
        // Ideally, use AI SDK or just iterator.
        const stream = await ragService.generateAnswerStream(context, userQuestion);

        // Create a ReadableStream for the response
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const text = chunk.text();
                    controller.enqueue(encoder.encode(text));
                }
                controller.close();
            },
        });

        return new NextResponse(readable, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
            },
        });

    } catch (error) {
        console.error("Chat API Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
