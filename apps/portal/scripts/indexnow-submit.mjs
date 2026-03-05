/**
 * Post-deploy script: Submit all sitemap URLs to IndexNow
 * 
 * This script runs after `next build` on Vercel and notifies search engines
 * about all public URLs. It calls the IndexNow API directly (not through the API route)
 * so it works during the build/deploy phase.
 * 
 * Required env vars:
 *   - INDEXNOW_API_KEY
 * 
 * Usage: node scripts/indexnow-submit.mjs
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const INDEXNOW_API_ENDPOINT = 'https://api.indexnow.org/IndexNow';
const SITE_HOST = 'schologic.com';

async function main() {
    const key = process.env.INDEXNOW_API_KEY;
    if (!key) {
        console.log('[IndexNow] INDEXNOW_API_KEY not set — skipping URL submission.');
        process.exit(0);
    }

    // Parse sitemap.xml for URLs
    const sitemapPath = join(__dirname, '..', 'public', 'sitemap.xml');
    let urls;
    try {
        const content = readFileSync(sitemapPath, 'utf-8');
        const locRegex = /<loc>(.*?)<\/loc>/g;
        urls = [];
        let match;
        while ((match = locRegex.exec(content)) !== null) {
            urls.push(match[1]);
        }
    } catch (err) {
        console.error('[IndexNow] Failed to read sitemap.xml:', err.message);
        process.exit(0); // Don't fail the build
    }

    if (urls.length === 0) {
        console.log('[IndexNow] No URLs found in sitemap.xml — skipping.');
        process.exit(0);
    }

    const payload = {
        host: SITE_HOST,
        key,
        keyLocation: `https://${SITE_HOST}/${key}.txt`,
        urlList: urls,
    };

    console.log(`[IndexNow] Submitting ${urls.length} URLs to IndexNow...`);

    try {
        const response = await fetch(INDEXNOW_API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(payload),
        });

        console.log(`[IndexNow] Response: ${response.status} ${response.statusText}`);

        if (response.status === 200 || response.status === 202) {
            console.log(`[IndexNow] ✓ Successfully submitted ${urls.length} URLs`);
        } else {
            const body = await response.text().catch(() => '');
            console.log(`[IndexNow] ✗ Submission returned status ${response.status}: ${body}`);
        }
    } catch (err) {
        console.error(`[IndexNow] ✗ Network error: ${err.message}`);
        // Don't fail the build over IndexNow issues
    }
}

main();
