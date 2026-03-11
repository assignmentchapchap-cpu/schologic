import { AiUsage } from './types';
import { GoogleGenAI } from '@google/genai';

// Initialize the new Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ProspectProfile {
    institution_name: string;
    location?: string | null;
    type?: string | null;
    website?: string | null;
    contact_name?: string | null;
    job_title?: string | null;
}

export interface ProspectingResult {
    subject: string;
    html: string;
    researchData: any;
    usage: AiUsage;
}

/**
 * Step A: Uses Gemini with Google Search Grounding to research the prospect's institution.
 * Step B: Uses that research + the provided template to generate a personalized cold email draft.
 */
export async function draftProspectEmail(
    prospect: ProspectProfile,
    templateSubject: string,
    templateHtml: string,
    regenerationNote?: string
): Promise<ProspectingResult> {

    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not defined in the environment.');
    }

    // 1. Research Phase
    // Using gemini-2.5-flash for fast, grounded research.
    console.log(`[AI-Bridge] Starting research phase for: ${prospect.institution_name}`);

    // Construct lookup query
    const lookupQuery = `
        Find recent news, academic focus areas, or strategic initiatives for "${prospect.institution_name}" 
        ${prospect.location ? `in ${prospect.location}` : ''} 
        ${prospect.website ? `(website: ${prospect.website})` : ''}.
        Identify 2-3 potential core challenges or "pain points" they might be facing based on current educational/institutional trends.
        If a contact person is provided (${prospect.contact_name}, ${prospect.job_title}), tailor the pain points to what their department might care about.
    `;

    const researchResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: lookupQuery,
        config: {
            tools: [{ googleSearch: {} }], // Enable Google Search Grounding
            temperature: 0.2, // Keep factual and grounded
        }
    });

    const researchText = researchResponse.text || "No research data found.";

    // Accumulate Usage
    let totalPromptTokens = researchResponse.usageMetadata?.promptTokenCount || 0;
    let totalCompletionTokens = researchResponse.usageMetadata?.candidatesTokenCount || 0;

    console.log(`[AI-Bridge] Research complete. Tokens: ${totalPromptTokens} in, ${totalCompletionTokens} out.`);

    // 2. Drafting Phase
    console.log(`[AI-Bridge] Starting drafting phase for: ${prospect.institution_name}`);

    const draftSystemPrompt = `
        You are an expert, highly-converting B2B sales copywriter specializing in the education sector.
        You are tasked with writing a personalized cold email to a prospect.
        
        INSTRUCTIONS:
        1. Review the PROVIDED TEMPLATE (Subject and HTML body).
        2. Review the EXTRACTED RESEARCH about the prospect.
        3. Fill in the template, replacing any placeholder variables (like {{name}}, {{institution}}).
        4. WEAVE IN the research naturally. Do not just paste facts. Use the identified pain points to demonstrate value and prove you did your homework.
        5. Keep the tone professional, concise, and compelling.
        ${regenerationNote ? `\nSPECIAL FEEDBACK FROM USER (MUST FOLLOW): ${regenerationNote}` : ''}
    `;

    const draftUserPrompt = `
        PROSPECT DATA:
        Name: ${prospect.contact_name || 'Not provided'}
        Title: ${prospect.job_title || 'Not provided'}
        Institution: ${prospect.institution_name}
        Type: ${prospect.type || 'Not provided'}
        Location: ${prospect.location || 'Not provided'}

        VERIFIED RESEARCH & PAIN POINTS:
        ${researchText}

        TEMPLATE SUBJECT:
        ${templateSubject}

        TEMPLATE BODY HTML:
        ${templateHtml}
        
        CRITICAL OUTPUT FORMAT:
        You MUST return ONLY a valid JSON object matching exactly this schema, with no markdown code blocks or wrapper text:
        {
            "subject": "The finalized personalized subject line",
            "html": "The finalized personalized HTML body content"
        }
    `;

    const draftResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { role: 'user', parts: [{ text: draftSystemPrompt }] },
            { role: 'user', parts: [{ text: draftUserPrompt }] }
        ],
        config: {
            temperature: 0.7, // Allow for some creative copywriting flair
            responseMimeType: 'application/json'
        }
    });

    totalPromptTokens += (draftResponse.usageMetadata?.promptTokenCount || 0);
    totalCompletionTokens += (draftResponse.usageMetadata?.candidatesTokenCount || 0);

    const draftResultJson = draftResponse.text;

    let parsedResult;
    try {
        parsedResult = JSON.parse(draftResultJson || '{}');
    } catch (e) {
        console.error('[AI-Bridge] Failed to parse draft JSON response:', draftResultJson);
        throw new Error('AI returned malformed JSON during drafting phase.');
    }

    if (!parsedResult.subject || !parsedResult.html) {
        throw new Error('AI failed to return required subject and html fields.');
    }

    return {
        subject: parsedResult.subject,
        html: parsedResult.html,
        researchData: {
            summary: researchText,
            source: 'Google Search via Gemini'
        },
        usage: {
            promptTokens: totalPromptTokens,
            completionTokens: totalCompletionTokens,
            totalTokens: totalPromptTokens + totalCompletionTokens
        }
    };
}
