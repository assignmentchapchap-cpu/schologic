
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { DEMO_CLASS, DEMO_STUDENTS, DEMO_ASSIGNMENTS, DEMO_SUBMISSION_TEXT_1, DEMO_SUBMISSION_TEXT_2, DEMO_AI_REPORTS, DEMO_RESOURCES, DEMO_STUDENT_PASSWORD, DEMO_PRACTICUM, DEMO_LOG_ENTRIES, DEMO_STUDENT_IDS, DEMO_SUPERVISOR_REPORTS } from '@/lib/demo-data';
import { v4 as uuidv4 } from 'uuid';
import { generateTimeline } from '@schologic/practicum-core';

// Initialize Supabase Admin Client (Service Role needed for creating users)
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

export async function POST(req: Request) {
    try {
        const { title, firstName, lastName, email } = await req.json();
        const fullName = `${firstName} ${lastName}`.trim();

        // 1. Create Auth User (Using provided email, skip verification)
        const password = `DemoPass_${uuidv4()}`; // Strong random password

        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                role: 'instructor',
                title: title,
                first_name: firstName,
                last_name: lastName,
                is_demo: true
            }
        });

        if (userError || !userData.user) {
            console.error("Demo User Create Error:", userError);
            // Check for various duplicate user error indicators
            const isDuplicate =
                userError?.code === 'unique_violation' ||
                userError?.status === 422 || // Supabase often returns 422 for existing users
                (userError?.message && /already registered|exists/i.test(userError.message));

            const status = isDuplicate ? 409 : 500;
            const message = status === 409 ? 'This email is already registered.' : 'Failed to create demo user';
            return NextResponse.json({ error: message, code: userError?.code, details: userError }, { status });
        }

        const userId = userData.user.id;

        // 2. Create Instructor Profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                email: email,
                role: 'instructor',
                full_name: fullName,
                title: title,
                // Assuming schema supports these, otherwise they are just in metadata
                // based on previous analysis, we need to be careful. 
                // We will try to rely on metadata mostly if columns miss, 
                // but user said to update profile.
            });

        if (profileError) {
            // Fallback: Just proceed, sometimes profile trigger handles it.
            console.error("Profile Upsert Error (non-fatal):", profileError);
        }

        // 2b. Enable practicum management for demo instructor
        await supabaseAdmin
            .from('profiles')
            .update({
                preferences: {
                    enable_practicum_management: true
                }
            })
            .eq('id', userId);

        // 3. Create Seed Data
        // A. Class
        const classId = uuidv4();
        const { error: classError } = await supabaseAdmin.from('classes').insert({
            id: classId,
            instructor_id: userId,
            name: DEMO_CLASS.name,
            class_code: DEMO_CLASS.class_code,
            start_date: DEMO_CLASS.start_date,
            end_date: DEMO_CLASS.end_date,
            settings: DEMO_CLASS.settings,
            invite_code: Math.random().toString(36).substring(7).toUpperCase(),
            is_locked: false
        });

        if (classError) throw classError;


        // B. Fetch shared demo students (permanent, not created per demo)
        const { data: students, error: studentFetchError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .in('id', DEMO_STUDENT_IDS)
            .eq('role', 'student');

        if (studentFetchError) {
            throw new Error(`Failed to fetch demo students: ${studentFetchError.message}`);
        }

        if (!students || students.length < 4) {
            throw new Error(`Insufficient demo students found. Expected 5, got ${students?.length || 0}. Ensure permanent demo students exist in Supabase.`);
        }

        console.log(`✅ Using ${students.length} shared demo students`);


        // C. Enrollments (Enroll only first 4 students, leave 1 for "Join Class" demo)
        const enrolledStudents = students.slice(0, 4);
        const enrollments = enrolledStudents.map(s => ({
            student_id: s.id,
            class_id: classId
        }));
        const { error: enrollError } = await supabaseAdmin.from('enrollments').insert(enrollments);
        if (enrollError) throw enrollError;


        // D. Class Resources (Notes)
        const assetInserts = DEMO_RESOURCES.map(r => ({
            id: uuidv4(),
            title: r.title,
            content: r.content,
            instructor_id: userId,
            asset_type: 'document',
            source: 'manual'
        }));

        const { data: insertedAssets, error: assetError } = await supabaseAdmin.from('assets').insert(assetInserts).select();

        if (assetError) {
            console.error("Asset Seed Error (non-fatal):", assetError);
        } else if (insertedAssets) {
            const classAssets = insertedAssets.map(asset => ({
                class_id: classId,
                asset_id: asset.id
            }));
            const { error: linkError } = await supabaseAdmin.from('class_assets').insert(classAssets);
            if (linkError) console.error("Class Asset Link Seed Error (non-fatal):", linkError);
        }

        // E. Assignments
        const assign1Id = uuidv4();
        const assign2Id = uuidv4();
        const assign3Id = uuidv4();

        const assignments = [
            {
                id: assign1Id,
                class_id: classId,
                ...DEMO_ASSIGNMENTS[0],
                short_code: DEMO_ASSIGNMENTS[0].short_code
            },
            {
                id: assign2Id,
                class_id: classId,
                ...DEMO_ASSIGNMENTS[1],
                short_code: DEMO_ASSIGNMENTS[1].short_code
            },
            {
                id: assign3Id,
                class_id: classId,
                ...DEMO_ASSIGNMENTS[2],
                short_code: DEMO_ASSIGNMENTS[2].short_code
            }
        ];

        const { error: assignError } = await supabaseAdmin.from('assignments').insert(assignments);
        if (assignError) throw assignError;

        // E. Submissions
        const submissions = [];

        // Assignment 1: 5 Submissions (3 Graded, 2 Ungraded) from our 5 students
        students.forEach((student, i) => {
            // Students 0, 1, 2 = Graded
            // Students 3, 4 = Ungraded (Submitted)
            const isGraded = i < 3;
            const aiData = isGraded ? DEMO_AI_REPORTS.assignment1_good : null;

            submissions.push({
                student_id: student.id,
                class_id: classId,
                assignment_id: assign1Id,
                content: DEMO_SUBMISSION_TEXT_1,
                grade: isGraded ? aiData?.score : null,
                ai_score: isGraded ? aiData?.ai_probability : null,
                report_data: isGraded ? aiData : null,
                feedback: isGraded ? "Great job utilizing the 4 Ps framework!" : null,
                created_at: new Date(Date.now() - Math.random() * 10000000).toISOString() // Randomize time
            });
        });

        // Assignment 2: 2 Submissions (1 Graded, 1 Ungraded) from first 2 students
        for (let i = 0; i < 2; i++) {
            if (i >= students.length) break;
            const student = students[i];
            const isGraded = i === 0;
            const aiData = isGraded ? DEMO_AI_REPORTS.assignment2_average : null;

            submissions.push({
                student_id: student.id,
                class_id: classId,
                assignment_id: assign2Id,
                content: DEMO_SUBMISSION_TEXT_2,
                grade: isGraded ? aiData?.score : null,
                ai_score: isGraded ? aiData?.ai_probability : null,
                report_data: isGraded ? aiData : null,
                feedback: isGraded ? "Good overview of trends." : null,
                created_at: new Date(Date.now() - Math.random() * 5000000).toISOString()
            });
        }

        // Quiz Submissions: 3 Students
        // 1. Perfect Score
        if (students.length > 0) {
            submissions.push({
                student_id: students[0].id,
                class_id: classId,
                assignment_id: assign3Id,
                content: null, // Quiz has no content
                grade: 20,
                ai_score: null,
                report_data: { q1: "Profit", q2: "Problem Recognition", q3: "Market Skimming Pricing", q4: "Age" }, // All correct
                feedback: null,
                created_at: new Date(Date.now() - Math.random() * 2000000).toISOString()
            });
        }
        // 2. Good Score (1 wrong)
        if (students.length > 1) {
            submissions.push({
                student_id: students[1].id,
                class_id: classId,
                assignment_id: assign3Id,
                content: null,
                grade: 15,
                ai_score: null,
                report_data: { q1: "Profit", q2: "Information Search", q3: "Market Skimming Pricing", q4: "Age" }, // q2 wrong
                feedback: null,
                created_at: new Date(Date.now() - Math.random() * 2000000).toISOString()
            });
        }
        // 3. Average Score (2 wrong)
        if (students.length > 2) {
            submissions.push({
                student_id: students[2].id,
                class_id: classId,
                assignment_id: assign3Id,
                content: null,
                grade: 10,
                ai_score: null,
                report_data: { q1: "Product", q2: "Problem Recognition", q3: "Cost-plus Pricing", q4: "Age" }, // q1, q3 wrong
                feedback: null,
                created_at: new Date(Date.now() - Math.random() * 2000000).toISOString()
            });
        }

        const { error: subError } = await supabaseAdmin.from('submissions').insert(submissions);
        if (subError) throw subError;

        // F. Create Practicum
        const practicumId = uuidv4();

        // Generate proper timeline with weeks and events
        const practicumTimeline = generateTimeline(
            DEMO_PRACTICUM.start_date,
            DEMO_PRACTICUM.end_date,
            DEMO_PRACTICUM.log_interval as 'daily' | 'weekly' | 'biweekly',
            DEMO_PRACTICUM.title
        );

        // Make codes unique to avoid conflicts with other demo accounts
        const uniqueSuffix = Date.now().toString().slice(-6);
        const uniqueCohortCode = `${DEMO_PRACTICUM.cohort_code}-${uniqueSuffix}`;
        const uniqueInviteCode = `TEACH${uniqueSuffix}`;

        const { error: practicumError } = await supabaseAdmin.from('practicums').insert({
            id: practicumId,
            instructor_id: userId,
            title: DEMO_PRACTICUM.title,
            cohort_code: uniqueCohortCode,
            invite_code: uniqueInviteCode,
            start_date: DEMO_PRACTICUM.start_date,
            end_date: DEMO_PRACTICUM.end_date,
            log_interval: DEMO_PRACTICUM.log_interval,
            auto_approve: DEMO_PRACTICUM.auto_approve,
            geolocation_required: DEMO_PRACTICUM.geolocation_required,
            final_report_required: DEMO_PRACTICUM.final_report_required,
            log_template: DEMO_PRACTICUM.log_template,
            logs_rubric: DEMO_PRACTICUM.logs_rubric,
            supervisor_report_template: DEMO_PRACTICUM.supervisor_report_template,
            student_report_template: DEMO_PRACTICUM.student_report_template,
            grading_config: DEMO_PRACTICUM.grading_config,
            timeline: practicumTimeline
        });

        if (!practicumError) {
            // Enroll first 4 students in practicum (reuse from class)
            const practicumEnrollments = students.slice(0, 4).map((student, index) => ({
                id: uuidv4(),
                practicum_id: practicumId,
                student_id: student.id,
                student_registration_number: student.registration_number,
                status: 'approved',
                academic_data: {
                    institution: 'Mombasa Technical Training Institute',
                    course: 'Diploma in Technical Teacher Education',
                    year_of_study: 'Year 3'
                },
                workplace_data: {
                    company_name: ['Greenfield High School', 'Riverside High School', 'Hillside Secondary', 'Lakeside Academy'][index],
                    address: [
                        'P.O. Box 1234, Kilifi Road, Mombasa',
                        'P.O. Box 5678, Nyali, Mombasa',
                        'P.O. Box 9101, Likoni, Mombasa',
                        'P.O. Box 1121, Bamburi, Mombasa'
                    ][index],
                    department: 'Mathematics Department'
                },
                supervisor_data: {
                    name: ['Ms. Johnson', 'Mr. Williams', 'Dr. Brown', 'Mrs. Davis'][index],
                    email: `supervisor${index + 1}@school${index + 1}.edu`,
                    phone: `+254700${100000 + index}`,
                    designation: 'Head of Mathematics'
                },
                student_email: student.email,
                student_phone: `+254${722000000 + index}`,
                schedule: {
                    monday: { start: '08:00', end: '14:00' },
                    tuesday: { start: '08:00', end: '14:00' },
                    wednesday: { start: '08:00', end: '14:00' },
                    thursday: { start: '08:00', end: '14:00' },
                    friday: { start: '08:00', end: '14:00' }
                },
                logs_grade: index < 2 ? (85 + Math.floor(Math.random() * 10)) : null,
                supervisor_grade: index < 2 ? (88 + Math.floor(Math.random() * 8)) : null,
                supervisor_report: index < 2 ? DEMO_SUPERVISOR_REPORTS[index] : null,
                joined_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            }));

            const { error: enrollmentError } = await supabaseAdmin.from('practicum_enrollments').insert(practicumEnrollments);

            if (enrollmentError) {
                console.error("❌ Failed to insert practicum enrollments:", enrollmentError);
                throw enrollmentError;
            }

            // Create logs for first 3 students (4 logs each = 12 total)
            const logEntries: any[] = [];
            for (let studentIndex = 0; studentIndex < 3; studentIndex++) {
                DEMO_LOG_ENTRIES.forEach((logTemplate) => {
                    logEntries.push({
                        id: uuidv4(),
                        practicum_id: practicumId,
                        student_id: students[studentIndex].id,
                        log_date: logTemplate.week,
                        submission_status: logTemplate.status === 'read' ? 'submitted' : 'draft',
                        instructor_status: logTemplate.status, // 'read' or 'unread'
                        entries: logTemplate.entries,
                        created_at: new Date(logTemplate.week).toISOString()
                    });
                });
            }

            const { error: logsError } = await supabaseAdmin.from('practicum_logs').insert(logEntries);

            if (logsError) {
                console.error("❌ Failed to insert practicum logs:", logsError);
                throw logsError;
            }

            console.log(`✅ Created practicum with ${practicumEnrollments.length} students and ${logEntries.length} log entries`);
        } else {
            console.error("Practicum creation error (non-fatal):", practicumError);
        }

        return NextResponse.json({
            email,
            password,
            redirect: '/instructor/dashboard',
            demo_student_email: students[4]?.email
        });

    } catch (error: any) {
        console.error("Demo Setup Error:", error);

        // Handle thrown errors from Supabase Admin (e.g. existing user 422)
        const isDuplicate =
            error?.status === 422 ||
            error?.code === 'email_exists' ||
            error?.code === 'unique_violation' ||
            (error?.message && /already registered|exists/i.test(error.message));

        if (isDuplicate) {
            return NextResponse.json({
                error: 'This email is already registered.',
                code: 'email_exists'
            }, { status: 409 });
        }

        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
