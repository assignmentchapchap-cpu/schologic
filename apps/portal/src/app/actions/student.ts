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

export async function enrollStudent(studentId: string, classId: string, fullName: string, regNumber: string) {
    try {
        // 1. Ensure Profile Exists (Upsert)
        // This prevents race conditions where the trigger hasn't fired yet or client update failed
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: studentId,
                full_name: fullName,
                registration_number: regNumber,
                role: 'student'
            });

        if (profileError) {
            console.error("Profile Upsert Error:", profileError);
            return { error: 'Failed to initialize student profile' };
        }

        // 2. Enroll
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
export async function verifyUnifiedInvite(code: string) {
    try {
        if (!code) return { error: 'Invite code is required' };
        const cleanCode = code.trim().toUpperCase();

        // 1. Check Class
        const { data: cls, error: clsErr } = await supabaseAdmin
            .from('classes')
            .select('id, is_locked, name')
            .eq('invite_code', cleanCode)
            .single();

        if (cls && !clsErr) {
            if (cls.is_locked) {
                return { error: 'This class is locked' };
            }
            return {
                success: true,
                type: 'class' as const,
                id: cls.id,
                name: cls.name
            };
        }

        // 2. Check Practicum
        const { data: prac, error: pracErr } = await supabaseAdmin
            .from('practicums')
            .select('id, title')
            .eq('invite_code', cleanCode)
            .single();

        if (prac && !pracErr) {
            return {
                success: true,
                type: 'practicum' as const,
                id: prac.id,
                name: prac.title
            };
        }

        return { error: 'Invalid invite code' };

    } catch (error: any) {
        console.error("Verify Unified Invite Error:", error);
        return { error: 'Failed to verify invite code' };
    }
}

export async function enrollStudentInPracticum(studentId: string, practicumId: string, fullName: string, regNumber: string) {
    try {
        // 1. Ensure Profile Exists (Upsert)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: studentId,
                full_name: fullName,
                registration_number: regNumber,
                role: 'student'
            });

        if (profileError) {
            console.error("Profile Upsert Error:", profileError);
            return { error: 'Failed to initialize student profile' };
        }

        // 2. Enroll in Practicum
        const { data: newEnroll, error } = await supabaseAdmin
            .from('practicum_enrollments')
            .insert([{
                student_id: studentId,
                practicum_id: practicumId,
                status: 'draft' // Initial status as pending setup
            }])
            .select('status')
            .single();

        if (error) {
            console.error("Practicum Enrollment Error:", error);
            if (error.code === '23505') return { error: 'Already enrolled' };
            return { error: 'Failed to enroll in practicum' };
        }

        // Defensive Check: Ensure status is actually draft
        if (newEnroll && newEnroll.status !== 'draft') {
            console.warn(`[AUDIT WARNING] Enrollment created with status '${newEnroll.status}' instead of 'draft'. Forced update required.`);

            // Force Update
            await supabaseAdmin
                .from('practicum_enrollments')
                .update({ status: 'draft' })
                .eq('student_id', studentId)
                .eq('practicum_id', practicumId);
        }

        return { success: true };
    } catch (error: any) {
        console.error("Enrollment Exception:", error);
        return { error: 'An unexpected error occurred during enrollment' };
    }
}
