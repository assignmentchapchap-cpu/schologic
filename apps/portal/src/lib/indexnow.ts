/**
 * IndexNow Integration Utilities
 * 
 * Provides helpers for submitting URLs to the IndexNow protocol,
 * enabling instant indexing by Bing, Yandex, Naver, and other participating search engines.
 * 
 * @see https://www.indexnow.org/documentation
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const INDEXNOW_API_ENDPOINT = 'https://api.indexnow.org/IndexNow';
const SITE_HOST = 'schologic.com';

/**
 * Get the IndexNow API key from environment variables.
 */
export function getIndexNowKey(): string {
    const key = process.env.INDEXNOW_API_KEY;
    if (!key) {
        throw new Error('INDEXNOW_API_KEY environment variable is not set');
    }
    return key;
}

/**
 * Parse the sitemap.xml file and extract all <loc> URLs.
 * Falls back to a hardcoded list if parsing fails.
 */
export function getSitemapUrls(): string[] {
    try {
        const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml');
        const sitemapContent = readFileSync(sitemapPath, 'utf-8');

        // Extract all <loc>...</loc> values using regex
        const locRegex = /<loc>(.*?)<\/loc>/g;
        const urls: string[] = [];
        let match;

        while ((match = locRegex.exec(sitemapContent)) !== null) {
            urls.push(match[1]);
        }

        return urls;
    } catch (error) {
        console.error('[IndexNow] Failed to parse sitemap.xml:', error);
        return [];
    }
}

/**
 * Submit a list of URLs to the IndexNow API for instant indexing.
 * 
 * @param urls - Array of URLs to submit. If empty, all sitemap URLs are submitted.
 * @returns The response status and details from the IndexNow API.
 */
export async function submitToIndexNow(urls?: string[]): Promise<{
    success: boolean;
    status: number;
    message: string;
    urlCount: number;
}> {
    const key = getIndexNowKey();
    const urlList = urls && urls.length > 0 ? urls : getSitemapUrls();

    if (urlList.length === 0) {
        return {
            success: false,
            status: 0,
            message: 'No URLs to submit. Check that sitemap.xml exists and contains URLs.',
            urlCount: 0,
        };
    }

    const payload = {
        host: SITE_HOST,
        key,
        keyLocation: `https://${SITE_HOST}/${key}.txt`,
        urlList,
    };

    console.log(`[IndexNow] Submitting ${urlList.length} URLs to IndexNow...`);

    try {
        const response = await fetch(INDEXNOW_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify(payload),
        });

        const statusText = getStatusMessage(response.status);

        console.log(`[IndexNow] Response: ${response.status} - ${statusText}`);

        return {
            success: response.status === 200 || response.status === 202,
            status: response.status,
            message: statusText,
            urlCount: urlList.length,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[IndexNow] Submission failed:', errorMessage);

        return {
            success: false,
            status: 0,
            message: `Network error: ${errorMessage}`,
            urlCount: urlList.length,
        };
    }
}

/**
 * Map IndexNow HTTP status codes to human-readable messages.
 */
function getStatusMessage(status: number): string {
    switch (status) {
        case 200:
            return 'OK — URLs submitted successfully';
        case 202:
            return 'Accepted — URLs received, key validation pending';
        case 400:
            return 'Bad Request — Invalid format';
        case 403:
            return 'Forbidden — Key not valid (check key file is hosted correctly)';
        case 422:
            return 'Unprocessable Entity — URLs not valid for this key';
        case 429:
            return 'Too Many Requests — Rate limited, try again later';
        default:
            return `Unexpected status code: ${status}`;
    }
}
