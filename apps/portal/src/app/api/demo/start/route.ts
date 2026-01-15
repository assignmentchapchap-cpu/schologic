
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { DEMO_CLASS, DEMO_STUDENTS, DEMO_ASSIGNMENTS, DEMO_SUBMISSION_TEXT_1, DEMO_SUBMISSION_TEXT_2, DEMO_AI_REPORTS, DEMO_RESOURCES, DEMO_STUDENT_PASSWORD } from '@/lib/demo-data';
import { v4 as uuidv4 } from 'uuid';

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
        const { title, firstName, lastName } = await req.json();
        const fullName = `${firstName} ${lastName}`.trim();

        // 1. Create Auth User
        const email = `demo_${Date.now()}_${Math.floor(Math.random() * 1000)}@schologic.demo`;
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
                last_name: lastName
            }
        });

        if (userError || !userData.user) {
            console.error("Demo User Create Error:", userError);
            return NextResponse.json({ error: 'Failed to create demo user' }, { status: 500 });
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

        // B. Students (Create Auth Users first to satisfy FK)
        // We reduce to 5 students to avoid rate limits/timeouts
        const studentSubset = DEMO_STUDENTS.slice(0, 5);
        const studentAuthPromises = studentSubset.map((s, i) => {
            const email = `student_${Date.now()}_${i}_${Math.floor(Math.random() * 999)}@schologic.demo`;
            return supabaseAdmin.auth.admin.createUser({
                email: email,
                password: DEMO_STUDENT_PASSWORD,
                email_confirm: true,
                user_metadata: {
                    full_name: `${s.first} ${s.last}`,
                    role: 'student'
                }
            });
        });

        const studentAuthResults = await Promise.all(studentAuthPromises);

        const students = studentAuthResults
            .map((res, index) => {
                if (res.data.user) {
                    const s = studentSubset[index];
                    return {
                        id: res.data.user.id, // Real Auth ID
                        role: 'student',
                        full_name: `${s.first} ${s.last}`,
                        email: res.data.user.email,
                        registration_number: `A${Math.floor(1000 + Math.random() * 9000)}`
                    };
                }
                console.error("Failed to create student user:", res.error);
                return null;
            })
            .filter((s): s is NonNullable<typeof s> => s !== null);

        if (students.length === 0) throw new Error("Failed to create any student accounts");

        const { error: studError } = await supabaseAdmin.from('profiles').upsert(students);
        if (studError) throw studError;

        // C. Enrollments (Enroll only first 4 students, leave 1 for "Join Class" demo)
        const enrolledStudents = students.slice(0, 4);
        const enrollments = enrolledStudents.map(s => ({
            student_id: s.id,
            class_id: classId
        }));
        const { error: enrollError } = await supabaseAdmin.from('enrollments').insert(enrollments);
        if (enrollError) throw enrollError;


        // D. Class Resources (Notes)
        const resources = DEMO_RESOURCES.map(r => ({
            id: uuidv4(),
            class_id: classId,
            title: r.title,
            content: r.content,
            created_by: userId
        }));

        const { error: resError } = await supabaseAdmin.from('class_resources').insert(resources);
        if (resError) console.error("Resource Seed Error (non-fatal):", resError);

        // E. Assignments
        const assign1Id = uuidv4();
        const assign2Id = uuidv4();

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

        const { error: subError } = await supabaseAdmin.from('submissions').insert(submissions);
        if (subError) throw subError;

        return NextResponse.json({
            email,
            password,
            redirect: '/instructor/dashboard',
            demo_student_email: students[4]?.email
        });

    } catch (error: any) {
        console.error("Demo Setup Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
