
import { NextRequest, NextResponse } from 'next/server';
import { RagService } from '@schologic/rag';

export const runtime = 'nodejs'; // Must be nodejs for transformers/fs

export async function POST(req: NextRequest) {
    try {
        const { message, history } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message required" }, { status: 400 });
        }

        const ragService = RagService.getInstance();

        // 1. Search for relevant context
        // We use a lower threshold for "support" - or strictly obey context. 
        // Let's use 0.65 to be safe.
        const contextChunks = await ragService.search(message, 0.65, 4);

        // 2. Stream Response
        const stream = await ragService.chatStream(message, history || [], contextChunks);

        // Convert the GoogleGenerativeAI stream to a ReadableStream for Next.js response
        const readableStream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of stream) {
                        const chunkText = chunk.text();
                        if (chunkText) {
                            controller.enqueue(encoder.encode(chunkText));
                        }
                    }
                    controller.close();
                } catch (err) {
                    console.error("Stream Error", err);
                    controller.error(err);
                }
            }
        });

        return new NextResponse(readableStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
