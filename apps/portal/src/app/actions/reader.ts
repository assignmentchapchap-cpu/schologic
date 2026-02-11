'use server';

import { convertToHtml as engineConvert } from '@schologic/doc-engine';

export async function convertDocxAction(url: string): Promise<string | null> {
    try {
        if (!url) return null;

        // Fetch the file server-side (prevents CORS issues and leverages server bandwidth)
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch docx from ${url}`);
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer); // Node.js Buffer is available here

        return await engineConvert(buffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    } catch (e) {
        console.error("Server Action convertDocx Failed:", e);
        return null;
    }
}
