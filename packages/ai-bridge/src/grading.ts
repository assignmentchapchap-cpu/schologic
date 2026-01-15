import { GradingRequest, GradingResult } from './types';

export async function analyzeSubmission(request: GradingRequest): Promise<GradingResult> {
    const {
        instructions,
        submission_text,
        score,
        max_points,
        student_name,
        assignment_title,
        rubric,
        apiKey
    } = request;

    if (!apiKey) throw new Error("Missing AI API Key");

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

    // Robust cleanup
    content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    const startIndex = content.indexOf('{');
    const endIndex = content.lastIndexOf('}');

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        content = content.substring(startIndex, endIndex + 1);
    } else {
        throw new Error("AI did not return a valid JSON object.");
    }

    const analysis = JSON.parse(content) as GradingResult;

    // STRICT SCORING ENFORCEMENT
    if (analysis.rubric_breakdown && Array.isArray(analysis.rubric_breakdown)) {
        let totalCalculatedScore = 0;

        analysis.rubric_breakdown.forEach((item: any) => {
            const level = (item.performance_level || "").toLowerCase().trim();
            let multiplier = 0.45; // Default fallback

            if (level.includes("exceptional")) multiplier = 0.85;
            else if (level.includes("very good")) multiplier = 0.65;
            else if (level.includes("good")) multiplier = 0.55;
            else if (level.includes("average")) multiplier = 0.45;
            else if (level.includes("poor")) multiplier = 0.20;

            const max = item.max || 0;
            const newScore = Math.round(max * multiplier);
            item.score = newScore;
            totalCalculatedScore += newScore;
        });

        analysis.score = totalCalculatedScore;
    }

    return analysis;
}

export async function generateRubric(request: any): Promise<any[]> {
    const { title, description, max_points, apiKey } = request;

    if (!apiKey) throw new Error("Missing AI API Key");

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

    console.log("Generating rubric via AI Bridge for:", title);

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
                { role: 'user', content: 'Generate the rubric JSON.' }
            ],
            temperature: 0.1,
            max_tokens: 2500
        })
    });

    if (!response.ok) {
        throw new Error(`PublicAI status: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const startIndex = content.indexOf('[');
    const endIndex = content.lastIndexOf(']');

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        content = content.substring(startIndex, endIndex + 1);
    } else {
        throw new Error("AI did not return a valid JSON array");
    }

    const rubric = JSON.parse(content);

    // Basic Validation
    const total = rubric.reduce((sum: number, item: any) => sum + (item.points || 0), 0);
    if (total !== max_points) {
        console.warn(`Generated rubric sum (${total}) does not match max_points (${max_points})`);
    }

    return rubric;
}
