'use client';

import React, { useEffect, useState } from 'react';
import Joyride, { Step } from 'react-joyride'; // Simplified imports
import { usePathname, useRouter } from 'next/navigation';
import { useDemoTour } from '@/context/DemoTourContext';
import { createClient } from "@schologic/database";
import { DEMO_STUDENT_PASSWORD } from '@/lib/demo-data';
import { useToast } from '@/context/ToastContext';

export default function DemoTour() {
    const { tourActive, tourStep, setTourStep, stopTour } = useDemoTour();
    const pathname = usePathname();
    const router = useRouter();
    const [steps, setSteps] = useState<Step[]>([]);
    const supabase = createClient();
    const { showToast } = useToast();
    const [role, setRole] = useState<'instructor' | 'student'>('instructor');
    const [runTour, setRunTour] = useState(false);

    // Detect Role
    useEffect(() => {
        if (pathname?.startsWith('/student')) setRole('student');
        else setRole('instructor');
    }, [pathname]);

    // Define steps and offsets
    const [stepOffset, setStepOffset] = useState(0);

    useEffect(() => {
        let currentSteps: Step[] = [];
        let offset = 0;

        if (role === 'instructor') {
            if (pathname === '/instructor/dashboard') {
                if (tourStep < 2) {
                    offset = 0;
                    currentSteps = [
                        {
                            target: 'body',
                            content: "Welcome to Schologic LMS! Let's take a quick 2-minute tour of how you can manage your classes and assignments with AI efficiency.",
                            placement: 'center',
                            disableBeacon: true,
                        },
                        {
                            target: '[data-tour="create-class-btn"]',
                            content: 'First, let\'s create a new class using our AI Assistant.',
                            spotlightClicks: true,
                            disableBeacon: true,
                        }
                    ];
                } else if (tourStep >= 6) {
                    offset = 6;
                    currentSteps = [
                        {
                            target: 'body',
                            content: 'Welcome back! Now let\'s grade the new submission.',
                            placement: 'center',
                        },
                        {
                            target: '[data-tour="submissions-card"]',
                            content: 'Click here to view pending submissions.',
                            spotlightClicks: true,
                        }
                    ];
                }
            } else if (pathname === '/instructor/classes' && window.location.search.includes('new=true')) {
                offset = 2;
                currentSteps = [
                    {
                        target: 'body',
                        content: 'Fill out the class details here. Use code "MKT101".',
                        placement: 'center',
                    },
                    {
                        target: 'button[type="submit"]',
                        content: 'Click "Create Class" to proceed.',
                        spotlightClicks: true,
                    }
                ]
            } else if (pathname === '/instructor/classes' && !window.location.search.includes('new=true')) {
                offset = 4;
                currentSteps = [
                    {
                        target: 'body',
                        content: 'Great! Your class is created. Now let\'s see the Student View to submit an assignment.',
                        placement: 'center',
                    },
                    {
                        target: 'body',
                        content: 'Click Next to switch roles instantly.',
                        placement: 'center',
                    }
                ];
            } else if (pathname?.startsWith('/instructor/class/')) {
                offset = 8;
                currentSteps = [
                    {
                        target: 'body',
                        content: 'This is the Class Details page. Click on a student submission to open the grading interface.',
                        placement: 'center',
                    }
                ];
            } else if (pathname?.startsWith('/instructor/submission')) {
                offset = 9;
                // Grading flow
                currentSteps = [
                    {
                        target: 'body',
                        content: 'This is the Grading Interface. Our AI has already analyzed the submission.',
                        placement: 'center',
                    },
                    {
                        target: '.ai-insight-panel',
                        content: 'Review the AI Insights and suggested grade here.',
                        placement: 'left',
                    }
                ];
            }
        } else if (role === 'student') {
            if (pathname === '/student/dashboard') {
                offset = 10;
                currentSteps = [
                    {
                        target: 'body',
                        content: 'You are now logged in as a Student! Let\'s join the class you just created.',
                        placement: 'center',
                        disableBeacon: true,
                    },
                    {
                        target: 'button:has(svg.lucide-plus)', // Need to verify this selector for student dash too
                        content: 'Click "Join Class" to enroll.',
                        spotlightClicks: true,
                    }
                ]
            } else if (pathname === '/student/classes') {
                offset = 12;
                currentSteps = [
                    {
                        target: 'body',
                        content: 'You are enrolled! Now let\'s switch back to the Instructor view to grade the submissions.',
                        placement: 'center'
                    }
                ]
            }
        }

        console.log('DemoTour State - GlobalStep:', tourStep, 'Offset:', offset, 'LocalIndex:', tourStep - offset, 'Steps:', currentSteps.length);

        setStepOffset(offset);
        setSteps(currentSteps);

        // Only run if active, we have steps, AND the global step falls within this page's range
        const shouldRun = tourActive &&
            currentSteps.length > 0 &&
            tourStep >= offset &&
            tourStep < (offset + currentSteps.length);

        setRunTour(shouldRun);

    }, [pathname, role, tourActive, tourStep]); // Added tourStep dependency to re-eval run condition

    const handleJoyrideCallback = async (data: any) => {
        const { status, type, index, action } = data;

        if (status === 'finished') {
            // Handle end of section transitions
            if (role === 'instructor' && pathname === '/instructor/classes' && !window.location.search.includes('new=true')) {
                await switchToStudent();
            } else if (role === 'student' && pathname === '/student/classes') {
                await switchToInstructor();
            } else {
                // Just normal finish of a step sequence, effectively moving to next offset?
                // Usually means we wait for user to navigate manually (e.g. click Create Class)
                setTourStep(tourStep + 1);
            }
        } else if (type === 'step:after' || action === 'next') {
            // Increment global step
            setTourStep(tourStep + 1);
        }
    };

    const switchToStudent = async () => {
        showToast('Switching to Student View...', 'info');
        await supabase.auth.signOut();
        const email = localStorage.getItem('demo_student_email');
        if (email) {
            localStorage.setItem('scholar_demo_tour_step', '10'); // Jump to Student Start
            await supabase.auth.signInWithPassword({
                email,
                password: DEMO_STUDENT_PASSWORD
            });
            window.location.href = '/student/dashboard';
        } else {
            showToast('Student account not found.', 'error');
        }
    };

    const switchToInstructor = async () => {
        showToast('Switching back to Instructor View...', 'info');
        await supabase.auth.signOut();
        const email = localStorage.getItem('demo_instructor_email');
        const password = localStorage.getItem('demo_instructor_password');

        if (email && password) {
            localStorage.setItem('scholar_demo_tour_step', '6'); // Jump to Grading Start
            await supabase.auth.signInWithPassword({
                email,
                password
            });
            window.location.href = '/instructor/dashboard'; // Or Submission page?
            // Ideally go to a submission. But dashboard is safer.
            // On dashboard, we might need to guide them to submission.
            // Let's assume they land on Dashboard, then we guide to Submission?
            // "offset=6" was assuming '/instructor/submission'.
            // If we land on dashboard, we fail offset check.
            // I should update Offset 0 logic to allow "Grading Phase" entry?
            // Or just route to '/instructor/submission/...' directly? Hard to know ID.
            // Let's route to Dashboard and add a step there "Click on Ungraded".
        } else {
            showToast('Instructor credentials lost. Please restart demo.', 'error');
        }
    };

    if (!tourActive) return null;

    return (
        <Joyride
            steps={steps}
            run={runTour}
            stepIndex={tourStep - stepOffset} // Local Index
            continuous
            showSkipButton
            showProgress
            styles={{
                options: {
                    zIndex: 10000,
                    primaryColor: '#4f46e5',
                },
            }}
            callback={handleJoyrideCallback}
        />
    );
}
