import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { createSessionClient } from '@schologic/database';
import { cookies } from 'next/headers';

export async function POST(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const practicumId = searchParams.get('practicumId');

    if (!filename || !practicumId) {
        return NextResponse.json({ error: 'Filename and practicumId are required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check enrollment
    const { data: enrollment, error: enrollError } = await supabase
        .from('practicum_enrollments')
        .select('id')
        .eq('practicum_id', practicumId)
        .eq('student_id', user.id)
        .single();

    if (enrollError || !enrollment) {
        console.error("Enrollment check failed:", enrollError);
        return NextResponse.json({ error: 'Enrollment not found' }, { status: 403 });
    }

    try {
        const blob = await put(filename, request.body as ReadableStream, {
            access: 'public',
        });

        // Update Enrollment Record
        const { error: updateError } = await supabase
            .from('practicum_enrollments')
            .update({
                student_report_url: blob.url,
            })
            .eq('id', enrollment.id);

        if (updateError) {
            console.error("Database update failed:", updateError);
            return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
        }

        return NextResponse.json(blob);
    } catch (error) {
        console.error("Blob upload failed:", error);
        return NextResponse.json({ error: 'Blob upload failed' }, { status: 500 });
    }
}
