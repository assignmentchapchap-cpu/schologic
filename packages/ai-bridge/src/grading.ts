import { GradingRequest, GradingResult, AiUsage } from './types';

export interface GradingResponse {
    analysis: GradingResult;
    usage: AiUsage;
}

export interface RubricResponse {
    rubric: any[];
    usage: AiUsage;
}

export async function analyzeSubmission(request: GradingRequest): Promise<GradingResponse> {
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

    // Capture real token usage from PublicAI response
    const usage: AiUsage = {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
    };

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

    return { analysis, usage };
}

export async function generateRubric(request: any): Promise<RubricResponse> {
    const { title, description, max_points, apiKey } = request;

    if (!apiKey) throw new Error("Missing AI API Key");

    const systemPrompt = `
    You are an expert curriculum developer.
    TASK: Create a grading rubric for this assignment.
    
    CONTEXT:
    - Title: "${title}"
    - Instructions/Description: "${description}"
    - Max Points: ${max_points}

    OUTPUT FORMAT:
    Return a STRICT JSON array of criteria objects.
    
    STRUCTURE:
    [
        {
            "criterion": "Name (e.g., Thesis Statement)",
            "importance": 1-5 (Integer), 
            "description": "Brief description of what is evaluated"
        }
    ]

    SCORING SCALE (Importance Level):
    5 - Extremely Important: Core learning objective (e.g., Thesis, Evidence)
    4 - Very Important: Key requirement (e.g., Structure, Analysis)
    3 - Fairly Important: Significant but secondary (e.g., Style, Tone)
    2 - Important: Supporting element (e.g., Grammar, Formatting)
    1 - Slightly Important: Minor detail (e.g., Word count adherence)

    RULES:
    1. Select 3-5 distinct criteria covering the assignment instructions.
    2. Assign an importance level (1-5) based on the scale above.
    3. Do NOT calculate points yourself. The system will handle math.
    4. Provide clear, actionable descriptions.
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
                { role: 'user', content: 'Generate the rubric structure.' }
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

    // Capture real token usage from PublicAI response
    const usage: AiUsage = {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
    };

    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const startIndex = content.indexOf('[');
    const endIndex = content.lastIndexOf(']');

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        content = content.substring(startIndex, endIndex + 1);
    } else {
        throw new Error("AI did not return a valid JSON array");
    }

    const rawCriteria = JSON.parse(content);

    // =========================================================
    // DETERMINISTIC SCORING ALGORITHM (5-POINT SCALE)
    // =========================================================

    // 1. Calculate Total Importance Weight
    let totalWeight = 0;

    const criteriaWithWeights = rawCriteria.map((c: any) => {
        // Enforce 1-5 range, default to 3 (Fairly Important) if missing/invalid
        let w = typeof c.importance === 'number' ? Math.round(c.importance) : 3;
        if (w < 1) w = 1;
        if (w > 5) w = 5;

        totalWeight += w;
        return { ...c, raw_weight: w };
    });

    // 2. Distribute Points PROPORTIONALLY
    let distributedTotal = 0;
    const normalizedCriteria = criteriaWithWeights.map((c: any) => {
        // (ItemWeight / TotalWeight) * MaxPoints
        const points = Math.round((c.raw_weight / totalWeight) * max_points);
        distributedTotal += points;
        return { ...c, points };
    });

    // 3. Checksum: Fix Rounding Errors (Adjust largest criterion)
    const diff = max_points - distributedTotal;
    if (diff !== 0) {
        // Find criterion with highest points to absorb the diff (minimizes relative impact)
        const targetIndex = normalizedCriteria.reduce((maxIdx: number, item: any, idx: number, arr: any[]) =>
            item.points > arr[maxIdx].points ? idx : maxIdx
            , 0);

        normalizedCriteria[targetIndex].points += diff;

        // Safety check to ensure no negative points (rare edge case)
        if (normalizedCriteria[targetIndex].points < 0) {
            normalizedCriteria[targetIndex].points = 0;
        }
    }

    // 4. Generate Deterministic Standard Levels
    // Multipliers scaled to the rubric standard
    const MULTIPLIERS = [
        { label: "Exceptional", factor: 1.0, desc: "Exceeds expectations; comprehensive and nuanced." },
        { label: "Very Good", factor: 0.8, desc: "Strong performance; meets all major requirements." },
        { label: "Good", factor: 0.6, desc: "Satisfactory; acceptable understanding with minor gaps." },
        { label: "Average", factor: 0.4, desc: "Basic; meets minimum standards but lacks depth." },
        { label: "Poor", factor: 0.2, desc: "Insufficient; fails to meet core requirements." }
    ];

    const finalRubric = normalizedCriteria.map((c: any) => ({
        criterion: c.criterion,
        points: c.points,
        description: c.description,
        levels: MULTIPLIERS.map(m => ({
            score: Math.round(c.points * m.factor),
            description: m.desc
        }))
    }));

    return { rubric: finalRubric, usage };
}
