'use server';

import { createSessionClient } from "@schologic/database";
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function updatePracticumGrades(enrollmentId: string, grades: {
    logs_grade?: number;
    report_grade?: number;
    supervisor_grade?: number;
    final_grade?: number;
}) {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);

    try {
        // Validate inputs (basic)
        if (!enrollmentId) throw new Error("Enrollment ID is required");

        // 1. Fetch current enrollment to handle partial updates if needed, 
        // but for now we trust the passed object contains what we want to update.
        // We filter out undefined values to avoid overwriting with null unless intended.
        const updatePayload: any = {};
        if (grades.logs_grade !== undefined) updatePayload.logs_grade = grades.logs_grade;
        if (grades.report_grade !== undefined) updatePayload.report_grade = grades.report_grade;
        if (grades.supervisor_grade !== undefined) updatePayload.supervisor_grade = grades.supervisor_grade;
        if (grades.final_grade !== undefined) updatePayload.final_grade = grades.final_grade;

        const { data, error } = await supabase
            .from('practicum_enrollments')
            .update(updatePayload)
            .eq('id', enrollmentId)
            .select();

        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }

        revalidatePath(`/instructor/practicum`); // Revalidate generally
        return { success: true };
    } catch (error: any) {
        console.error("Error updating practicum grades:", error);
        return { success: false, error: error.message };
    }
}

// Optionally: Auto-calc helper if we want to run it from UI
export async function syncSupervisorGrades(practicumId: string) {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);

    try {
        // Fetch all enrollments with supervisor reports
        const { data: enrollments, error } = await supabase
            .from('practicum_enrollments')
            .select('id, supervisor_report')
            .eq('practicum_id', practicumId);

        if (error) throw error;

        const updates = enrollments
            .filter((e: any) => e.supervisor_report && e.supervisor_report.total_score)
            .map((e: any) => ({
                id: e.id,
                supervisor_grade: e.supervisor_report.total_score
            }));

        // Batch update is hard in Supabase Postgrest without RPC, so loop for now (or Promise.all)
        // For 50-100 students this is okay.
        await Promise.all(updates.map((u: any) =>
            supabase.from('practicum_enrollments').update({ supervisor_grade: u.supervisor_grade }).eq('id', u.id)
        ));

        revalidatePath(`/instructor/practicum/${practicumId}`);
        return { success: true, count: updates.length };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
