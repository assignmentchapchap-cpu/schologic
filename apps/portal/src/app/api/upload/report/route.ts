import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { createClient } from '@schologic/database';

export async function POST(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const practicumId = searchParams.get('practicumId');

    if (!filename || !practicumId) {
        return NextResponse.json({ error: 'Filename and practicumId are required' }, { status: 400 });
    }

    const supabase = createClient();
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
        return NextResponse.json({ error: 'Enrollment not found' }, { status: 403 });
    }

    const blob = await put(filename, request.body as ReadableStream, {
        access: 'public',
    });

    // Update Enrollment Record
    const { error: updateError } = await supabase
        .from('practicum_enrollments')
        .update({
            student_report_url: blob.url,
            // We might want to store submission date too if there's a specific column, 
            // checking schema showed 'updated_at' but maybe not a specific submission date?
            // existing 'joined_at' and 'approved_at'. 
            // We'll rely on the presence of the URL or maybe we should abuse 'instructor_notes' or similar? 
            // No, let's just stick to the URL for now.
        })
        .eq('id', enrollment.id);

    if (updateError) {
        return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
    }

    return NextResponse.json(blob);
}
