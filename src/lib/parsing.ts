
import mammoth from 'mammoth';

/**
 * Safely extracts text from various file formats.
 * Wraps "risky" parsers (like pdf-parse) in try/catch and lazy loads them
 * to prevent build-time errors in Next.js Server Components.
 */
export async function extractTextFromFile(file: File): Promise<{ content: any, title?: string } | null> {
    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const type = file.type;
        const name = file.name.toLowerCase();

        if (type === 'application/pdf') {
            const content = await extractPdfSafe(buffer);
            return content ? { content } : null;
        }

        if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const content = await extractDocxSafe(buffer);
            return content ? { content } : null;
        }

        if (name.endsWith('.imscc') || type === 'application/zip' || type === 'application/x-zip-compressed') {
            return await extractImsccSafe(buffer);
        }

        return null;
    } catch (e) {
        console.error("Parsing Error:", e);
        return null; // Fail silently, don't block upload
    }
}

async function extractPdfSafe(buffer: Buffer): Promise<string | null> {
    try {
        // Lazy load pdf-parse to avoid "fs" build errors in Edge/Client environments
        // and to isolate the potential crash.
        console.log("Loading pdf-parse...");
        // Lazy load pdf-parse
        const pdfModule = require('pdf-parse');

        // Strategy: Based on logs, it exports an object with PDFParse key
        // We try standard module, default, or named PDFParse
        const parser = (typeof pdfModule === 'function' ? pdfModule :
            (pdfModule.default || pdfModule.PDFParse || pdfModule));

        console.log("PDF Parser Type:", typeof parser);

        // Fix: Library requires explicit Uint8Array, rejects Node Buffer
        const uint8Array = new Uint8Array(buffer);
        const instance = new parser(uint8Array);

        // Try standard v2 method
        if (instance.getText) {
            return await instance.getText();
        }

        return null;
    } catch (e) {
        console.error("PDF Parsing Failed:", e);
        return null;
    }
}

async function extractDocxSafe(buffer: Buffer): Promise<string | null> {
    try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || null;
    } catch (e) {
        console.error("DOCX Parsing Failed:", e);
        return null;
    }
}

async function extractImsccSafe(buffer: Buffer): Promise<{ content: any, title?: string } | null> {
    try {
        console.log("Loading JSZip & xml2js...");
        const JSZip = require('jszip');
        const xml2js = require('xml2js');

        const zip = await JSZip.loadAsync(buffer);

        // Find imsmanifest.xml anywhere in the zip (ignoring case and __MACOSX)
        let manifestPath: string | null = null;
        zip.forEach((relativePath: string, file: any) => {
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
        });
        const result = await parser.parseStringPromise(xmlContent);

        console.log("IMSCC Manifest Parsed");

        // DEBUG: Log the metadata structure to see where the title is
        // console.log("DEBUG METADATA:", JSON.stringify(result.manifest?.metadata, null, 2));

        // Attempt Title Extraction
        let title: string | undefined = undefined;
        try {
            // With stripPrefix: true, we look for 'metadata.lom.general.title.string'
            // instead of 'metadata.lomimscc:lom.lomimscc:general...'

            // 1. Handle namespaced 'lomimscc:' path (explicitly seen in logs)
            const namespacedTitle = result.manifest?.metadata?.['lomimscc:lom']?.['lomimscc:general']?.['lomimscc:title']?.['lomimscc:string']?._ ||
                result.manifest?.metadata?.['lomimscc:lom']?.['lomimscc:general']?.['lomimscc:title']?.['lomimscc:string'];

            // 2. Common Cartridge Location (metadata -> lom -> general -> title -> string)
            const metadataTitle = result.manifest?.metadata?.lom?.general?.title?.string?._ ||
                result.manifest?.metadata?.lom?.general?.title?.string;

            // 3. Organization Title
            const orgs = result.manifest?.organizations?.organization;
            const orgTitle = Array.isArray(orgs) ? orgs[0]?.title : orgs?.title;

            // 4. Fallback: Search anywhere for a title string if structured lookup fails
            // (Only do this if explicit paths fail)

            title = namespacedTitle || metadataTitle || orgTitle;

            // Cleanup title (remove whitespace, newlines)
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
