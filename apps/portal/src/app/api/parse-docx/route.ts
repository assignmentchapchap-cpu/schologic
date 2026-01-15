import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromDocx } from '@/lib/file-processing';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const text = await extractTextFromDocx(buffer);

        return NextResponse.json({ text });
    } catch (error) {
        console.error("Parse Error:", error);
        return NextResponse.json({ error: "Failed to parse file" }, { status: 500 });
    }
}
