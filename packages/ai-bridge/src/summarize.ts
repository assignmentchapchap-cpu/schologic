
export async function summarizeText(text: string, apiKey: string, context?: string): Promise<string[]> {
    if (!text) throw new Error("No text provided for summarization");
    if (!apiKey) throw new Error("Missing AI API Key");

    const contextInstruction = context
        ? `\n\nUSER FOCUS: ${context}\nPrioritize information related to the user's focus area.`
        : '';

    const systemPrompt = `
    You are an expert educational content summarizer.
    TASK: Summarize the provided text into 3-5 concise bullet points.${contextInstruction}
    
    OUTPUT FORMAT:
    Return a single JSON object with a "points" array of strings.
    Example: { "points": ["Point 1", "Point 2", "Point 3"] }
    `;

    console.log("Sending summarization request to PublicAI (Text length: " + text.length + ")" + (context ? " with context" : ""));

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
                { role: 'user', content: `TEXT: ${text.substring(0, 12000)}` }
            ],
            temperature: 0.3,
            max_tokens: 500,
            response_format: {
                type: 'json_schema',
                json_schema: {
                    name: 'summary_response',
                    strict: true,
                    schema: {
                        type: 'object',
                        properties: {
                            points: {
                                type: 'array',
                                items: { type: 'string' }
                            }
                        },
                        required: ['points'],
                        additionalProperties: false
                    }
                }
            }
        })
    });

    if (!response.ok) {
        throw new Error(`PublicAI status: ${response.status}`);
    }

    const data = await response.json();
    try {
        const contentStr = data.choices[0].message.content;
        const contentObj = JSON.parse(contentStr);
        // Convert to markdown list string to maintain signature compatibility for now, 
        // OR return the array. The action expects a string wrapper or we change the signature.
        // Let's change the return type to string[] for better typing.
        return contentObj.points;
    } catch (e) {
        console.error("Failed to parse AI response", e);
        return ["Summary unavailable."];
    }
}
