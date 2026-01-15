import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { title, description, max_points } = await req.json();

        if (!title || !max_points) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const apiKey = process.env.PUBLICAI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });

        const systemPrompt = `
        You are an expert curriculum developer.
        TASK: Create a grading rubric for this assignment.
        
        CONTEXT:
        - Title: "${title}"
        - Instructions/Description: "${description}"
        - Max Points: ${max_points}

        RULES:
        1. Total points across all criteria MUST sum to EXACTLY ${max_points}.
        2. Criteria must be derived STRICTLY from the provided Instructions.
        3. Optimization: Best suited for essays/assignments < 2000 words.
        4. Output strictly valid JSON only. NO markdown blocks.

        JSON STRUCTURE:
        [
            {
                "criterion": "Name of criterion",
                "points": 20,
                "levels": [
                    { "score": 20, "description": "Excellent performance..." },
                    { "score": 10, "description": "Needs improvement..." }
                ]
            }
        ]
        `;

        const response = await fetch('https://api.publicai.co/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'swiss-ai/apertus-70b-instruct',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: 'Generate the rubric JSON.' }
                ],
                temperature: 0.1, // Strict/Deterministic
                max_tokens: 2500
            })
        });

        if (!response.ok) {
            throw new Error(`PublicAI status: ${response.status}`);
        }

        const data = await response.json();
        let content = data.choices[0].message.content;

        // Clean cleanup if model wraps in markdown
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        // Robust Extraction: Find first [ and last ]
        const startIndex = content.indexOf('[');
        const endIndex = content.lastIndexOf(']');

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            content = content.substring(startIndex, endIndex + 1);
        } else {
            console.error("AI Response content format invalid:", content);
            throw new Error("AI did not return a valid JSON array");
        }

        const rubric = JSON.parse(content);

        // Basic Validation: Check point sum
        const total = rubric.reduce((sum: number, item: any) => sum + (item.points || 0), 0);
        if (total !== max_points) {
            // Fallback warning or adjustment could go here, but for now we trust the prompt + prompt engineering
            console.warn(`Generated rubric sum (${total}) does not match max_points (${max_points})`);
        }

        return NextResponse.json({ rubric });

    } catch (error: any) {
        console.error("Rubric Generation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
