
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import ReportForm from './ReportForm';

// We duplicate this here to avoid circular imports or just import it 
// but for standard server component logic, let's keep it self-contained if possible
// or just re-implemented the verify logic quickly since it's only 2 lines.

function verifyLink(enrollmentId: string, expiresAt: number, signature: string) {
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const data = `${enrollmentId}:${expiresAt}`;
    const expected = crypto.createHmac('sha256', secret).update(data).digest('hex');
    return signature === expected;
}

export default async function SupervisorReportPage({
    params,
    searchParams
}: {
    params: Promise<{ enrollmentId: string }>,
    searchParams: Promise<{ sig: string; expires: string }>
}) {
    const { enrollmentId } = await params;
    const { sig, expires } = await searchParams;

    // 1. Validate Parameters
    if (!enrollmentId || !sig || !expires) {
        console.log(`[SupervisorReportPage] Missing params`);
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Link</h1>
                    <p className="text-slate-500">This report link is missing required parameters.</p>
                </div>
            </div>
        );
    }

    // 2. Verify Signature
    const expiresAt = parseInt(expires, 10);
    if (Date.now() > expiresAt) {
        console.log(`[SupervisorReportPage] Link expired. Now: ${Date.now()}, Expires: ${expiresAt}`);
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-900 mb-2">Link Expired</h1>
                    <p className="text-slate-500">This report link has expired. Please contact the instructor for a new one.</p>
                </div>
            </div>
        );
    }

    if (!verifyLink(enrollmentId, expiresAt, sig)) {
        console.log(`[SupervisorReportPage] Signature mismatch for ${enrollmentId}`);
        // Log expected vs actual (careful with secrets in logs, but here we just log mismatch)
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h1>
                    <p className="text-slate-500">The signature for this link is invalid.</p>
                </div>
            </div>
        );
    }

    // 3. Fetch Data (Enrollment + Practicum) - Fetch Profile separately to avoid FK error
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: enrollment, error } = await supabase
        .from('practicum_enrollments')
        .select(`
            id, supervisor_report, student_id,
            practicums:practicum_id ( title, log_template, supervisor_report_template )
        `)
        .eq('id', enrollmentId)
        .single();

    if (error || !enrollment) {
        console.error(`[SupervisorReportPage] Enrollment not found (or error) for ${enrollmentId}`, error);
        return notFound();
    }

    // Fetch Profile Manually
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', enrollment.student_id)
        .single();

    const isSubmitted = !!enrollment.supervisor_report;

    const studentName = profile?.full_name || 'Student';
    const practicumData = Array.isArray(enrollment.practicums) ? enrollment.practicums[0] : enrollment.practicums;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 md:pt-0">
                <div className="bg-slate-900 px-8 py-10 text-center relative overflow-hidden rounded-3xl mb-8 shadow-lg md:-mx-8 md:rounded-b-3xl md:rounded-t-none">
                    <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')] bg-center" />
                    <h1 className="text-2xl md:text-3xl font-black text-white mb-2 relative z-10">Final Supervisor Report</h1>
                    <p className="text-emerald-400 font-bold relative z-10 uppercase tracking-widest text-xs mb-4">Schologic Practicum Assessment</p>
                    <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                            <p className="text-slate-200 text-sm">
                                Student: <span className="font-bold text-white">{studentName}</span>
                            </p>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                            {(practicumData as any)?.title}
                        </p>
                    </div>
                </div>

                {/* Render Form */}
                <ReportForm
                    enrollmentId={enrollmentId}
                    studentName={studentName}
                    practicumTitle={(practicumData as any)?.title || 'Practicum'}
                    templateId={(practicumData as any)?.log_template || 'teaching_practice'}
                    customTemplate={(practicumData as any)?.supervisor_report_template}
                    signature={sig}
                    expiresAt={expiresAt}
                />

            </div>
        </div>
    );
}
