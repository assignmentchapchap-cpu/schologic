'use server';

import { extractTextFromFile } from '@schologic/doc-engine';
import { summarizeText } from '@schologic/ai-bridge';

export interface SummarizeOptions {
    context?: string;
    pages?: string; // e.g., "1-3, 5, 7-9"
}

export async function generateSummary(fileUrl: string, mimeType: string, options?: SummarizeOptions) {
    if (!fileUrl) {
        return { error: 'No file URL provided', summary: null };
    }

    try {
        console.log(`[Summarize] Fetching file: ${fileUrl}`);
        if (options?.context) console.log(`[Summarize] User context: ${options.context}`);
        if (options?.pages) console.log(`[Summarize] Pages requested: ${options.pages}`);

        const response = await fetch(fileUrl);

        if (!response.ok) {
            console.error(`[Summarize] Failed to fetch file: ${response.status}`);
            return { error: `Failed to fetch file (${response.status})`, summary: null };
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`[Summarize] Extracting text (Size: ${buffer.length}, Mime: ${mimeType})`);

        const fileName = fileUrl.split('/').pop() || 'document.bin';

        // TODO: In the future, pass options.pages to extractTextFromFile for page-specific extraction
        // For now, we extract all text and let the AI focus based on context
        const parseResult = await extractTextFromFile(buffer, mimeType, fileName);

        const text = typeof parseResult?.content === 'string' ? parseResult.content : null;

        // Handle Scanned PDFs
        if (parseResult?.metadata?.isScanned) {
            return {
                error: 'This document appears to be a scanned PDF (image only). We can only summarize text-selectable PDFs.',
                summary: null
            };
        }

        if (!text || text.length < 50) {
            return { error: 'Could not extract enough text from this document.', summary: null };
        }

        console.log(`[Summarize] Text extracted (${text.length} chars). Calling AI...`);

        const apiKey = process.env.PUBLICAI_API_KEY;
        if (!apiKey) return { error: 'Server misconfiguration: No API Key', summary: null };

        // Pass user context to AI if provided
        const summary = await summarizeText(text, apiKey, options?.context);

        return { error: null, summary };

    } catch (error: any) {
        console.error('[Summarize] Error:', error);
        return { error: error.message || 'Failed to generate summary', summary: null };
    }
}
