import { createClient } from '@/lib/supabase';
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

        const systemPrompt = `
        You are a strict JSON data generator for an AI Teaching Assistant.
        
        TASK: analyze the student submission based on instructions${rubric ? ' and rubric' : ''}.
        
        INPUT DATA:
        - Instructions: ${instructions}
        ${rubric ? `- RUBRIC: ${JSON.stringify(rubric)}` : ''}
        - AI Score: ${score}% (If > 60%, FLAG this in weaknesses)
        - Max Points: ${max_points}

        OUTPUT FORMAT:
        Return a single valid JSON object. Do not output markdown, explanations, or any text outside the JSON.
        
        JSON SCHEMA:
        {
            "strengths": ["Bulleted point (7-12 words)", "Bulleted point (7-12 words)"],
            "weaknesses": ["Bulleted point (7-12 words)", "Bulleted point (7-12 words)"],
            "rubric_breakdown": [
                {
                    "criterion": "Exact Criterion Name from Rubric",
                    "performance_level": "Exceptional | Very Good | Good | Average | Poor",
                    "score": "INTEGER_VALUE",
                    "max": "MAX_POINTS_FROM_RUBRIC",
                    "reason": "Brief explanation (4-6 words)"
                }
            ],
            "score": "CALCULATED_TOTAL_INTEGER"
        }

        GRADING LOGIC (DETERMINISTIC MULTIPLIERS):
        To ensure consistency, you MUST use these specific multipliers for scoring. Do not guess the score.

        | Level | Criteria | Multiplier |
        | :--- | :--- | :--- |
        | **Exceptional** | Outstanding; exceeds all requirements | **0.85** |
        | **Very Good** | Strong; very few minor errors | **0.65** |
        | **Good** | Satisfactory; meets most requirements | **0.55** |
        | **Average** | Basic; significant gaps | **0.45** |
        | **Poor** | Fail; does not meet minimums | **0.20** |

        CONSTRAINTS:
        - Provide at least 2 distinct Strengths and 2 distinct Weaknesses.
        - Bullets must be short (7-12 words).
        - "rubric_breakdown" MUST include EVERY criterion from the input RUBRIC.
        - For EACH criterion in "rubric_breakdown":
          1. Select the "performance_level" (Exceptional, Very Good, etc.).
          2. LOOK UP the corresponding "Multiplier" from the table above.
          3. CALCULATE "score" = ROUND( "max" * Multiplier ).
        - "reason" must be very short (4-6 words).
        - IF AI Score > 60%: Must add "(AI FLAG: CONTENT SEEMS ARTIFICIAL)" as a weakness.
        - Weaknesses must NOT contradict Strengths.
        - CALCULATE the final "score" by summing all criterion scores.
        - Strict JSON syntax.
        `;

        console.log("Sending optimized request to PublicAI for:", assignment_title);

        const response = await fetch('https://api.publicai.co/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'User-Agent': 'SchologicLMS/1.0'
            },
            body: JSON.stringify({
                model: 'swiss-ai/apertus-70b-instruct',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `STUDENT: ${student_name}. TEXT: ${submission_text.substring(0, 4000)}` }
                ],
                temperature: 0.1,
                max_tokens: 1000,
                response_format: {
                    type: 'json_schema',
                    json_schema: {
                        name: 'teaching_assistant_analysis',
                        strict: true,
                        schema: {
                            type: 'object',
                            properties: {
                                strengths: {
                                    type: 'array',
                                    items: { type: 'string' }
                                },
                                weaknesses: {
                                    type: 'array',
                                    items: { type: 'string' }
                                },
                                rubric_breakdown: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            criterion: { type: 'string' },
                                            performance_level: { type: 'string' },
                                            score: { type: 'number' },
                                            max: { type: 'number' },
                                            reason: { type: 'string' }
                                        },
                                        required: ['criterion', 'performance_level', 'score', 'max', 'reason'],
                                        additionalProperties: false
                                    }
                                },
                                score: { type: 'number' }
                            },
                            required: ['strengths', 'weaknesses', 'rubric_breakdown', 'score'],
                            additionalProperties: false
                        }
                    }
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("PublicAI Error:", errorText);
            throw new Error(`PublicAI status: ${response.status}`);
        }

        const data = await response.json();
        let content = data.choices[0].message.content;

        // Robust cleanup: removing compatible markdown code blocks if present (case insensitive)
        content = content.replace(/```json/gi, '').replace(/```/g, '').trim();

        // Robust Extraction: Find first { and last }
        const startIndex = content.indexOf('{');
        const endIndex = content.lastIndexOf('}');

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            content = content.substring(startIndex, endIndex + 1);
        } else {
            console.error("AI Response content format invalid:", content);
            throw new Error("AI did not return a valid JSON object. Content: " + content.substring(0, 100));
        }

        const analysis = JSON.parse(content);

        // ---------------------------------------------------------
        // STRICT BACKEND SCORING ENFORCEMENT
        // We do not trust the AI's math. We recalculate everything based on the qualitative level.
        // ---------------------------------------------------------
        if (analysis.rubric_breakdown && Array.isArray(analysis.rubric_breakdown)) {
            let totalCalculatedScore = 0;

            analysis.rubric_breakdown.forEach((item: any) => {
                const level = (item.performance_level || "").toLowerCase().trim();
                let multiplier = 0.45; // Default fallback to 'Average' (0.45) if unrecognized

                if (level.includes("exceptional")) multiplier = 0.85;
                else if (level.includes("very good")) multiplier = 0.65;
                else if (level.includes("good")) multiplier = 0.55;
                else if (level.includes("average")) multiplier = 0.45;
                else if (level.includes("poor")) multiplier = 0.20;

                // Force the score to match the multiplier
                // Ensure max points exist
                const max = item.max || 0;
                const newScore = Math.round(max * multiplier);

                // Overwrite the AI's score
                item.score = newScore;

                totalCalculatedScore += newScore;
            });

            // Overwrite the total score
            analysis.score = totalCalculatedScore;
        }
        // ---------------------------------------------------------

        return NextResponse.json({ analysis });

    } catch (error: any) {
        console.error("TA API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
