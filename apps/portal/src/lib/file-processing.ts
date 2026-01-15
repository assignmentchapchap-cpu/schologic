import { extractTextFromDocx } from "@schologic/doc-engine";

export async function extractTextFromDocxFile(fileBuffer: Buffer): Promise<string> {
    try {
        return await extractTextFromDocx(fileBuffer);
    } catch (error) {
        console.error("File Processing Error:", error);
        throw new Error("Failed to process document");
    }
}

// For backward compatibility if needed, alias to the same function
export async function extractTextFromDocx(fileBuffer: Buffer): Promise<string> {
    return extractTextFromDocxFile(fileBuffer);
}
