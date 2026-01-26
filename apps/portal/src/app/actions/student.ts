'use server';

import { createClient } from '@supabase/supabase-js';

// Admin client for checking constraints without RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function verifyClassInvite(code: string) {
    try {
        if (!code) return { error: 'Invite code is required' };

        const { data: cls, error: clsErr } = await supabaseAdmin
            .from('classes')
            .select('id, is_locked, name')
            .eq('invite_code', code.trim().toUpperCase())
            .single();

        if (clsErr || !cls) {
            return { error: 'Invalid class invite code' };
        }

        if (cls.is_locked) {
            return { error: 'This class is locked' };
        }

        return {
            success: true,
            classId: cls.id,
            className: cls.name
        };

    } catch (error: any) {
        console.error("Verify Invite Error:", error);
        return { error: 'Failed to verify invite code' };
    }
}

export async function enrollStudent(studentId: string, classId: string) {
    try {
        const { error } = await supabaseAdmin
            .from('enrollments')
            .insert([{
                student_id: studentId,
                class_id: classId
            }]);

        if (error) {
            console.error("Enrollment Error:", error);
            if (error.code === '23505') return { error: 'Already enrolled' };
            return { error: 'Failed to enroll in class' };
        }

        return { success: true };
    } catch (error: any) {
        console.error("Enrollment Exception:", error);
        return { error: 'An unexpected error occurred during enrollment' };
    }
}
