import { analyzeSubmission } from "@schologic/ai-bridge";
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            instructions,
            submission_text,
            score,
            max_points,
            student_name,
            instructor_name,
            class_name,
            assignment_title,
            rubric
        } = body;

        const apiKey = process.env.PUBLICAI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });

        console.log("Analyzing submission via AI Bridge for:", assignment_title);

        const analysis = await analyzeSubmission({
            instructions,
            submission_text,
            score,
            max_points,
            student_name,
            instructor_name,
            class_name,
            assignment_title,
            rubric,
            apiKey
        });

        return NextResponse.json({ analysis });

    } catch (error: any) {
        console.error("TA API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
