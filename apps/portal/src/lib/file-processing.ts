import mammoth from 'mammoth';

export async function extractTextFromDocx(fileBuffer: Buffer): Promise<string> {
    try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        return result.value; // The raw text
    } catch (error) {
        console.error("Error parsing DOCX:", error);
        throw new Error("Failed to parse document.");
    }
}
