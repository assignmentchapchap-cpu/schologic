
import mammoth from 'mammoth';
import JSZip from 'jszip';
import xml2js from 'xml2js';

// pdf-parse v2 is imported inside extractTextFromPdf function

// ============ IMSCC Types ============
export interface ImsccTocItem {
    id: string;
    title: string;
    resourceRef?: string;
    children: ImsccTocItem[];
}

export interface ImsccResource {
    type: 'weblink' | 'webcontent' | 'lti' | 'unknown';
    href?: string;
    url?: string;
    title?: string;
}

export interface ImsccContent {
    title: string;
    toc: ImsccTocItem[];
    resources: Record<string, ImsccResource>;
}

export interface ParseResult {
    content: any; // String for simple text, ImsccContent for IMSCC
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


        // Robust PDF Check
        if (mimeType === 'application/pdf' || name.endsWith('.pdf')) {
            console.log("DocEngine: Detected PDF, parsing...");
            const result = await extractTextFromPdf(buffer);

            if (!result) return null; // Parsing failed

            if (result.text.length === 0 && result.numpages > 0) {
                console.warn(`DocEngine: PDF scanned detection (Pages: ${result.numpages}, Text: 0)`);
                return {
                    content: "",
                    metadata: { isScanned: true, pageCount: result.numpages }
                };
            }

            return { content: result.text };
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

interface PdfExtractResult {
    text: string;
    numpages: number;
}

export async function extractTextFromPdf(buffer: Buffer): Promise<PdfExtractResult | null> {
    try {
        console.log(`DocEngine: Starting PDF Parse (v2). Buffer size: ${buffer.length} bytes`);

        // pdf-parse v2 uses class-based API
        const { PDFParse } = require('pdf-parse');
        const parser = new PDFParse({ data: buffer });

        // Get document info for page count
        const info = await parser.getInfo();
        const textResult = await parser.getText();
        await parser.destroy();

        console.log("DocEngine: PDF Parse Result:", {
            numpages: info.total,
            textLength: textResult.text ? textResult.text.length : 0,
            hasText: !!textResult.text
        });

        return {
            text: textResult.text ? textResult.text.trim() : "",
            numpages: info.total || 0
        };
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

export async function convertToHtml(buffer: Buffer, mimeType: string): Promise<string | null> {
    try {
        if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.convertToHtml({ buffer });
            return result.value || null;
        }
        return null;
    } catch (e) {
        console.error("HTML Conversion Failed:", e);
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
            stripPrefix: true
        } as any);
        const result = await parser.parseStringPromise(xmlContent);

        // ===== Extract Title =====
        let title = 'Untitled Cartridge';
        try {
            const namespacedTitle = result.manifest?.metadata?.['lomimscc:lom']?.['lomimscc:general']?.['lomimscc:title']?.['lomimscc:string']?._ ||
                result.manifest?.metadata?.['lomimscc:lom']?.['lomimscc:general']?.['lomimscc:title']?.['lomimscc:string'];
            const metadataTitle = result.manifest?.metadata?.lom?.general?.title?.string?._ ||
                result.manifest?.metadata?.lom?.general?.title?.string;
            const orgs = result.manifest?.organizations?.organization;
            const orgTitle = Array.isArray(orgs) ? orgs[0]?.title : orgs?.title;
            title = namespacedTitle || metadataTitle || orgTitle || title;
            if (typeof title === 'string') title = title.trim();
        } catch (e) {
            console.warn("IMSCC Title Extraction Failed:", e);
        }

        // ===== Build Resources Map =====
        const resources: Record<string, ImsccResource> = {};
        const rawResources = result.manifest?.resources?.resource;
        const resourceList = Array.isArray(rawResources) ? rawResources : (rawResources ? [rawResources] : []);

        for (const res of resourceList) {
            const id = res.identifier;
            const type = res.type || '';
            const href = res.file?.href || res.href;

            let resourceType: ImsccResource['type'] = 'unknown';
            if (type.includes('imswl')) resourceType = 'weblink';
            else if (type.includes('webcontent')) resourceType = 'webcontent';
            else if (type.includes('basiclti') || type.includes('imsbasiclti')) resourceType = 'lti';

            const resource: ImsccResource = { type: resourceType, href };

            // For weblinks, extract URL from the XML file
            if (resourceType === 'weblink' && href) {
                try {
                    const linkFile = zip.file(href);
                    if (linkFile) {
                        const linkXml = await linkFile.async('string');
                        const linkParser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true, stripPrefix: true } as any);
                        const linkData = await linkParser.parseStringPromise(linkXml);
                        resource.url = linkData.webLink?.url?.href;
                        resource.title = linkData.webLink?.title;
                    }
                } catch (e) {
                    console.warn(`IMSCC: Failed to parse weblink file ${href}:`, e);
                }
            }

            resources[id] = resource;
        }

        // ===== Build TOC Tree =====
        function parseItem(item: any): ImsccTocItem {
            const children: ImsccTocItem[] = [];
            if (item.item) {
                const items = Array.isArray(item.item) ? item.item : [item.item];
                for (const child of items) {
                    children.push(parseItem(child));
                }
            }
            return {
                id: item.identifier || '',
                title: item.title || 'Untitled',
                resourceRef: item.identifierref,
                children
            };
        }

        const toc: ImsccTocItem[] = [];
        const orgs = result.manifest?.organizations?.organization;
        if (orgs) {
            const org = Array.isArray(orgs) ? orgs[0] : orgs;
            if (org.item) {
                const items = Array.isArray(org.item) ? org.item : [org.item];
                for (const item of items) {
                    toc.push(parseItem(item));
                }
            }
        }

        const imsccContent: ImsccContent = { title, toc, resources };
        console.log(`IMSCC Parsed: "${title}" with ${toc.length} chapters, ${Object.keys(resources).length} resources`);

        return { content: imsccContent, title };
    } catch (e) {
        console.error("IMSCC Parsing Failed:", e);
        return null;
    }
}
