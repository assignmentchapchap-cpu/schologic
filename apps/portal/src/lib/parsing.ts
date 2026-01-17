import { extractTextFromDocx, extractTextFromPdf } from "@schologic/doc-engine";


/**
 * Safely extracts text from various file formats.
 * Wraps package calls for PDF and DOCX.
 * IMSCC handling remains local for now as it's portal-specific logic.
 */
export async function extractTextFromFile(file: File): Promise<{ content: any, title?: string } | null> {
    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const type = file.type;
        const name = file.name.toLowerCase();

        if (type === 'application/pdf') {
            const content = await extractTextFromPdf(buffer);
            return content ? { content } : null;
        }

        if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const content = await extractTextFromDocx(buffer);
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

// Kept for backward compatibility if imported elsewhere, but now uses package
export async function parsePdf(buffer: Buffer): Promise<string | null> {
    return extractTextFromPdf(buffer);
}

export async function parseDocx(buffer: Buffer): Promise<string | null> {
    return extractTextFromDocx(buffer);
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

        // Attempt Title Extraction
        let title: string | undefined = undefined;
        try {
            // 1. Handle namespaced 'lomimscc:' path
            const namespacedTitle = result.manifest?.metadata?.['lomimscc:lom']?.['lomimscc:general']?.['lomimscc:title']?.['lomimscc:string']?._ ||
                result.manifest?.metadata?.['lomimscc:lom']?.['lomimscc:general']?.['lomimscc:title']?.['lomimscc:string'];

            // 2. Common Cartridge Location
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
