'use server';

import { extractTextFromFile } from '@schologic/doc-engine';
import { summarizeText } from '@schologic/ai-bridge';
import { cookies } from 'next/headers';
import { createSessionClient } from '@schologic/database';
import { logAiUsage } from '@/lib/logAiUsage';


export interface SummarizeOptions {
    context?: string;
    pages?: string;
    selectedSections?: { id: string; title: string; resourceRef: string }[];
}

// Helper: Check if content is IMSCC structure
function isImsccContent(content: any): content is { toc: any[]; resources: Record<string, any> } {
    return content && typeof content === 'object' && Array.isArray(content.toc) && content.resources;
}

// Helper: Fetch text from URL (for IMSCC weblinks)
async function fetchTextFromUrl(url: string): Promise<string> {
    try {
        const res = await fetch(url, { headers: { 'User-Agent': 'SchologicLMS/1.0' } });
        if (!res.ok) return '';
        const html = await res.text();
        // Basic HTML to text: strip tags
        return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    } catch {
        return '';
    }
}

export async function generateSummary(fileUrl: string, mimeType: string, options?: SummarizeOptions) {
    if (!fileUrl) {
        return { error: 'No file URL provided', summary: null };
    }

    try {
        console.log(`[Summarize] Fetching file: ${fileUrl}`);
        if (options?.context) console.log(`[Summarize] User context: ${options.context}`);
        if (options?.selectedSections?.length) {
            console.log(`[Summarize] Selected sections: ${options.selectedSections.map(s => s.title).join(', ')}`);
        }

        const response = await fetch(fileUrl);

        if (!response.ok) {
            console.error(`[Summarize] Failed to fetch file: ${response.status}`);
            return { error: `Failed to fetch file (${response.status})`, summary: null };
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`[Summarize] Extracting text (Size: ${buffer.length}, Mime: ${mimeType})`);

        const fileName = fileUrl.split('/').pop() || 'document.bin';
        const parseResult = await extractTextFromFile(buffer, mimeType, fileName);

        let text: string = '';

        // Handle IMSCC files (structured content with weblinks)
        if (parseResult && isImsccContent(parseResult.content)) {
            console.log(`[Summarize] IMSCC detected.`);
            const { resources } = parseResult.content;

            let urlsToFetch: string[] = [];

            // Use exact selectedSections if provided (from UI checkbox selection)
            if (options?.selectedSections?.length) {
                for (const section of options.selectedSections) {
                    const res = resources[section.resourceRef];
                    if (res?.url) {
                        urlsToFetch.push(res.url);
                    }
                }
                console.log(`[Summarize] Using ${urlsToFetch.length} selected section(s)`);
            } else {
                // Fallback: fetch first 3 sections
                const allUrls = Object.values(resources)
                    .filter((r: any) => r.url)
                    .map((r: any) => r.url)
                    .slice(0, 3);
                urlsToFetch = allUrls;
                console.log(`[Summarize] No sections selected, using first ${urlsToFetch.length} resources`);
            }

            console.log(`[Summarize] Fetching ${urlsToFetch.length} weblink(s)...`);

            const texts = await Promise.all(urlsToFetch.map(fetchTextFromUrl));
            text = texts.filter(Boolean).join('\n\n').substring(0, 15000); // Limit total text

            if (!text || text.length < 100) {
                return {
                    error: 'Could not fetch content from this IMSCC file. The linked content may be inaccessible.',
                    summary: null
                };
            }
        } else {
            // Handle regular text content
            text = typeof parseResult?.content === 'string' ? parseResult.content : '';
        }

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

        // Extract user session for usage tracking
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();

        const { points, usage } = await summarizeText(text, apiKey, options?.context);

        // Log AI usage with real token counts (fire-and-forget)
        if (user) {
            logAiUsage({
                instructorId: user.id,
                endpoint: '/actions/summarize',
                provider: 'publicai',
                model: 'swiss-ai/apertus-70b-instruct',
                promptTokens: usage.promptTokens,
                completionTokens: usage.completionTokens,
                totalTokens: usage.totalTokens,
                isDemo: user.user_metadata?.is_demo === true,
            });
        }

        return { error: null, summary: points };

    } catch (error: any) {
        console.error('[Summarize] Error:', error);
        return { error: error.message || 'Failed to generate summary', summary: null };
    }
}

