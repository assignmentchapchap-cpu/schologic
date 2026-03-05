import { NextRequest, NextResponse } from 'next/server';
import { submitToIndexNow } from '@/lib/indexnow';

/**
 * POST /api/indexnow
 * 
 * Submit URLs to IndexNow for instant search engine indexing.
 * Protected by a bearer token (INDEXNOW_ADMIN_SECRET env var).
 * 
 * Usage:
 *   curl -X POST https://schologic.com/api/indexnow \
 *     -H "Authorization: Bearer <INDEXNOW_ADMIN_SECRET>" \
 *     -H "Content-Type: application/json" \
 *     -d '{"urls": ["https://schologic.com/features"]}'
 * 
 * If no "urls" array is provided, all sitemap URLs are submitted.
 * 
 * This route is designed to be called from a Vercel post-deploy hook.
 */
export async function POST(request: NextRequest) {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.INDEXNOW_ADMIN_SECRET;

    if (!expectedSecret) {
        console.error('[IndexNow API] INDEXNOW_ADMIN_SECRET is not configured');
        return NextResponse.json(
            { error: 'Server configuration error' },
            { status: 500 }
        );
    }

    const token = authHeader?.replace('Bearer ', '');
    if (!token || token !== expectedSecret) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        // Parse optional URL list from request body
        let urls: string[] | undefined;

        try {
            const body = await request.json();
            if (body.urls && Array.isArray(body.urls)) {
                urls = body.urls;
            }
        } catch {
            // No body or invalid JSON — will submit all sitemap URLs
        }

        const result = await submitToIndexNow(urls);

        return NextResponse.json(result, {
            status: result.success ? 200 : 502,
        });
    } catch (error) {
        console.error('[IndexNow API] Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
