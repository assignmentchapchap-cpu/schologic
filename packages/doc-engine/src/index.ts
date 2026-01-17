
import mammoth from 'mammoth';
import JSZip from 'jszip';
import xml2js from 'xml2js';

// Use require for pdf-parse to avoid TS import issues with its default export
const pdfParse = require('pdf-parse');

export interface ParseResult {
    content: any; // String for simple text, Object for structured data (IMSCC)
    title?: string;
    metadata?: any;
}

/**
 * Safely extracts text/content from various file formats.
 * Centralized logic for the entire monorepo.
 */
export async function extractTextFromFile(buffer: Buffer, mimeType: string, fileName: string): Promise<ParseResult | null> {
    try {
        const name = fileName.toLowerCase();

        if (mimeType === 'application/pdf') {
            const content = await extractTextFromPdf(buffer);
            return content ? { content } : null;
        }

        if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const content = await extractTextFromDocx(buffer);
            return content ? { content } : null;
        }

        if (name.endsWith('.imscc') || mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed') {
            return await extractImsccSafe(buffer);
        }

        return null;
    } catch (e) {
        console.error("DocEngine Parsing Error:", e);
        return null;
    }
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string | null> {
    try {
        const parser = pdfParse.default || pdfParse;
        const data = await parser(buffer);
        return data.text ? data.text.trim() : null;
    } catch (e) {
        console.error("PDF Parsing Failed:", e);
        return null;
    }
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string | null> {
    try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value ? result.value.trim() : null;
    } catch (e) {
        console.error("DOCX Parsing Failed:", e);
        return null;
    }
}

async function extractImsccSafe(buffer: Buffer): Promise<ParseResult | null> {
    try {
        const zip = await JSZip.loadAsync(buffer);

        // Find imsmanifest.xml anywhere in the zip (ignoring case and __MACOSX)
        let manifestPath: string | null = null;
        zip.forEach((relativePath, file) => {
            if (relativePath.toLowerCase().endsWith('imsmanifest.xml') && !relativePath.includes('__MACOSX')) {
                manifestPath = relativePath;
            }
        });

        if (!manifestPath) {
            console.warn("IMSCC: No imsmanifest.xml found in archive");
            return null;
        }

        const manifestFile = zip.file(manifestPath);
        if (!manifestFile) return null;

        const xmlContent = await manifestFile.async('string');
        const parser = new xml2js.Parser({
            explicitArray: false,
            mergeAttrs: true,
            stripPrefix: true // Simplify XML by removing namespaces
        } as any); // Cast to any to avoid TS error for stripPrefix which exists in the lib but maybe missing in types
        const result = await parser.parseStringPromise(xmlContent);

        // Attempt Title Extraction
        let title: string | undefined = undefined;
        try {
            // 1. Handle namespaced 'lomimscc:' path (if explicit prefix remained or via loose lookup)
            const namespacedTitle = result.manifest?.metadata?.['lomimscc:lom']?.['lomimscc:general']?.['lomimscc:title']?.['lomimscc:string']?._ ||
                result.manifest?.metadata?.['lomimscc:lom']?.['lomimscc:general']?.['lomimscc:title']?.['lomimscc:string'];

            // 2. Common Cartridge Location (metadata -> lom -> general -> title -> string)
            const metadataTitle = result.manifest?.metadata?.lom?.general?.title?.string?._ ||
                result.manifest?.metadata?.lom?.general?.title?.string;

            // 3. Organization Title
            const orgs = result.manifest?.organizations?.organization;
            const orgTitle = Array.isArray(orgs) ? orgs[0]?.title : orgs?.title;

            title = namespacedTitle || metadataTitle || orgTitle;

            if (title && typeof title === 'string') {
                title = title.trim();
            } else {
                title = undefined;
            }

        } catch (e) {
            console.warn("IMSCC Title Extraction Failed:", e);
        }

        return { content: result, title };
    } catch (e) {
        console.error("IMSCC Parsing Failed:", e);
        return null;
    }
}
