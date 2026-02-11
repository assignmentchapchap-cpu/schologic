import { generateRubric } from "@schologic/ai-bridge";
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { title, description, max_points } = await req.json();

        if (!title || !max_points) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const apiKey = process.env.PUBLICAI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });

        const rubric = await generateRubric({
            title,
            description,
            max_points,
            apiKey
        });

        return NextResponse.json({ rubric });

    } catch (error: unknown) {
        console.error("Rubric Generation Error:", error);
        const message = error instanceof Error ? error.message : 'Rubric generation failed.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
