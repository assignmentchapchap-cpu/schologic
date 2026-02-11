import { extractTextFromFile } from "@schologic/doc-engine";

export async function extractTextFromDocxFile(fileBuffer: Buffer): Promise<string> {
    try {
        // Use the unified function with DOCX mime type
        const result = await extractTextFromFile(
            fileBuffer,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'temp.docx'
        );
        return typeof result?.content === 'string' ? result.content : "";
    } catch (error) {
        console.error("File Processing Error:", error);
        throw new Error("Failed to process document");
    }
}

// For backward compatibility if needed, alias to the same function
export async function extractTextFromDocx(fileBuffer: Buffer): Promise<string> {
    return extractTextFromDocxFile(fileBuffer);
}
