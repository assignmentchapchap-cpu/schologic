import { RubricConfig, PracticumObservationGuide, PracticumReportScoreSheet } from './types';

// 1. Teaching Practice Observation Guide
export const TEACHING_PRACTICE_OBSERVATION_GUIDE: PracticumObservationGuide = {
    title: "TEACHING PRACTICE OBSERVATION GUIDE",
    grading_key: {
        "5": "Exceeds Expectations (EE)",
        "4": "Meets Expectations (ME)",
        "3": "Approaching Expectations (AE)",
        "2": "Below Expectations (BE)",
        "1": "Far Below Expectations (FBE)"
    },
    assessment_areas: [
        {
            "category": "PERSONAL ATTRIBUTES",
            "attributes": [
                {
                    "id": "i",
                    "attribute": "Punctuality",
                    "description": "Arrival at school, meetings, class & assigned duties, meets set deadlines"
                },
                {
                    "id": "ii",
                    "attribute": "Modesty in dress code",
                    "description": "As per the TSC Code of Regulations of 2015"
                }
            ]
        },
        {
            "category": "CORE COMPETENCIES",
            "attributes": [
                {
                    "id": "i",
                    "competency": "Communication and collaboration",
                    "description": "Speaks clearly, shows confidence, listens, asks questions, learns from others, is passionate/enthusiastic, shows respect, self-motivated, interested in teamwork"
                },
                {
                    "id": "ii",
                    "competency": "Creativity and imagination",
                    "description": "Able to improvise, Focused, curious, generates new ideas etc."
                },
                {
                    "id": "iii",
                    "competency": "Critical thinking and problem solving",
                    "description": "Solves problems, offers alternative solutions, pay attention, seek clarification, is flexible, adapts to different situations, reflects and assesses etc."
                },
                {
                    "id": "iv",
                    "competency": "Digital literacy",
                    "description": "Operates digital devices, uses technology in a variety of ways, observes Safety while using digital devices, diagnoses and Fixes faults in digital devices"
                },
                {
                    "id": "v",
                    "competency": "Self-efficacy",
                    "description": "Shows interest in learning, portrays a sense of self-worth, shows resilience after setbacks, embraces challenges, is persistent and committed"
                },
                {
                    "id": "vi",
                    "competency": "Learning to learn",
                    "description": "Is organized, self-disciplined, develops new working relationships, Adjusts accordingly"
                },
                {
                    "id": "vii",
                    "competency": "Citizenship",
                    "description": "Adheres to regulations, respects those in authority, cares for environment, appreciates school culture, participates in school activities both inside and outside the classroom, participates in community service, accommodates others, observes chapter six of our constitution etc."
                },
                {
                    "id": "viii",
                    "competency": "Core values",
                    "description": "Portrays caring attitude, resolves conflicts, displays trustworthiness, respects others, honest, displays humility, open-minded, puts the interest of others before own interest, is patient"
                }
            ]
        }
    ],
    total_score: 50
};

// 2. Industrial Attachment Observation Guide
export const INDUSTRIAL_ATTACHMENT_OBSERVATION_GUIDE: PracticumObservationGuide = {
    title: "INDUSTRIAL ATTACHMENT OBSERVATION GUIDE",
    grading_key: {
        "5": "Exceeds Expectations (EE)",
        "4": "Meets Expectations (ME)",
        "3": "Approaching Expectations (AE)",
        "2": "Below Expectations (BE)",
        "1": "Far Below Expectations (FBE)"
    },
    assessment_areas: [
        {
            "category": "PERSONAL ATTRIBUTES",
            "attributes": [
                {
                    "id": "i",
                    "attribute": "Punctuality",
                    "description": "Arrival at workplace, meetings, assigned tasks & duties, meets set deadlines"
                },
                {
                    "id": "ii",
                    "attribute": "Professional Attire",
                    "description": "Adheres to industry safety standards and organizational dress code"
                }
            ]
        },
        {
            "category": "CORE COMPETENCIES",
            "attributes": [
                {
                    "id": "i",
                    "competency": "Communication and collaboration",
                    "description": "Speaks clearly, shows confidence, listens, asks questions, learns from others, is passionate/enthusiastic, shows respect, self-motivated, interested in teamwork"
                },
                {
                    "id": "ii",
                    "competency": "Creativity and imagination",
                    "description": "Able to improvise solutions, Focused, curious, generates new ideas etc."
                },
                {
                    "id": "iii",
                    "competency": "Critical thinking and problem solving",
                    "description": "Solves technical problems, offers alternative solutions, pays attention to detail, seeks clarification, is flexible, adapts to different situations"
                },
                {
                    "id": "iv",
                    "competency": "Digital literacy",
                    "description": "Operates industry devices/software efficiently, uses technology in a variety of ways, observes Safety while using digital devices, diagnoses and fixes faults"
                },
                {
                    "id": "v",
                    "competency": "Self-efficacy",
                    "description": "Shows interest in learning, portrays a sense of self-worth, shows resilience after setbacks, embraces challenges, is persistent and committed"
                },
                {
                    "id": "vi",
                    "competency": "Learning to learn",
                    "description": "Is organized, self-disciplined, develops new working relationships, Adjusts to workplace dynamics effectively"
                },
                {
                    "id": "vii",
                    "competency": "Citizenship",
                    "description": "Adheres to regulations, respects those in authority, cares for environment, appreciates organizational culture, participates in company activities, participates in community service, accommodates others, observes chapter six of our constitution etc."
                },
                {
                    "id": "viii",
                    "competency": "Core values",
                    "description": "Portrays caring attitude, resolves conflicts, displays trustworthiness, respects others, honest, displays humility, open-minded, puts the interest of others before own interest, is patient"
                }
            ]
        }
    ],
    total_score: 50
};

// 3. Practicum Report Score Sheet (Exact content from user)
export const PRACTICUM_REPORT_SCORE_SHEET: PracticumReportScoreSheet = {
    title: "PRACTICUM REPORT SCORE SHEET",
    sections: [
        {
            item_number: 1,
            section: "COVER PAGE",
            details: "Identification details",
            marks: 2
        },
        {
            item_number: 2,
            section: "PRELIMINARY PAGES",
            total_marks: 12,
            subsections: [
                { title: "Declaration page", marks: 1 },
                { title: "Acknowledgement", marks: 1 },
                { title: "Dedication", marks: 1 },
                { title: "Table of contents", marks: 2 },
                { title: "List of tables", marks: 1 },
                { title: "List of figures", marks: 1 },
                { title: "List of abbreviation and acronyms", marks: 1 },
                { title: "Definition of terms", marks: 2 },
                { title: "Executive Summary", marks: 2 }
            ]
        },
        {
            item_number: 3,
            section: "SECTION 1: INTRODUCTION: School/company Profile",
            total_marks: 12,
            subsections: [
                { id: "1.1", title: "Geographical location", marks: 2 },
                { id: "1.2", title: "Historical background", marks: 2 },
                { id: "1.3", title: "Vision", marks: 2 },
                { id: "1.4", title: "Mission", marks: 2 },
                { id: "1.5", title: "Core values", marks: 2 },
                { id: "1.6", title: "School/organization structure", marks: 2 },
                { id: "1.7", title: "Details of placement department", marks: 4 }
            ]
        },
        {
            item_number: 4,
            section: "SECTION 2: PRACTICUM EXPERIENCES",
            total_marks: 20,
            subsections: [
                { id: "2.1", title: "Purpose, set of learning outcomes and general activities undertaken", marks: 3 },
                { id: "2.2", title: "Specific activities undertaken", marks: 3 },
                { id: "2.3", title: "An analysis of learnt knowledge and applied skills", marks: 6 },
                { id: "2.4", title: "A profile of skills and competencies gained/acquired", marks: 3 },
                { id: "2.5", title: "Observations and critique: (what learned; what not learned; relevance of experience to training etc.)", marks: 5 }
            ]
        },
        {
            item_number: 5,
            section: "SECTION 3",
            total_marks: 10,
            subsections: [
                { id: "3.1", title: "Summary", marks: 4 },
                { id: "3.2", title: "Conclusion", marks: 3 },
                { id: "3.3", title: "Recommendations", marks: 3 }
            ]
        },
        {
            item_number: 6,
            section: "REFERENCES",
            details: "Citation of sources used in report if any",
            marks: 2
        },
        {
            item_number: 7,
            section: "APPENDICES",
            details: "Relevant attached E.g. Logbook, charts etc.",
            marks: 2
        }
    ],
    total_report_marks: 60,
    final_grading_notes: [
        "The Practicum report will be marked out of 60%",
        "Supervisor will constitute 50% of the total mark for the course.",
        "Instructor assessment will constitute 50% of the total mark for the course."
    ]
};

// 4. Logs Assessment (Unchanged)
export const LOGS_ASSESSMENT_RUBRIC: RubricConfig = {
    id: 'logs_assessment_default',
    title: 'PRACTICUM LOGS ASSESSMENT RUBRIC',
    total_marks: 40,
    sections: [
        {
            id: 'timeliness',
            title: 'SECTION 1: TIMELINESS & CONSISTENCY (10 Marks)',
            description: 'Assessment of the student\'s adherence to the submission schedule.',
            criteria: [
                {
                    id: 'submission_adherence',
                    label: 'Timeliness of Submission',
                    max_points: 10,
                    description: 'Consistently submits log entries on time as per the schedule (Daily/Weekly) without requiring reminders.'
                }
            ]
        },
        {
            id: 'content_quality',
            title: 'SECTION 2: CONTENT QUALITY & REFLECTION (20 Marks)',
            description: 'Evaluation of the depth and relevance of the logged activities.',
            criteria: [
                {
                    id: 'insight',
                    label: 'Insight & Reflection',
                    max_points: 10,
                    description: 'Demonstrates deep reflection on learning experiences, challenges faced, and solutions found. Connects theory to practice.'
                },
                {
                    id: 'application',
                    label: 'Practical Application',
                    max_points: 10,
                    description: 'Evidence of applying skills learned in class to the practical environment. Clear description of tasks and outcomes.'
                }
            ]
        },
        {
            id: 'professionalism',
            title: 'SECTION 3: PROFESSIONAL CONDUCT & VERIFICATION (10 Marks)',
            description: 'Assessment of professional standards in documentation and physical presence.',
            criteria: [
                {
                    id: 'professionalism',
                    label: 'Professionalism in Reporting',
                    max_points: 5,
                    description: 'Uses professional language, correct grammar/spelling, accurate data, and maintains a formal tone in all entries.'
                },
                {
                    id: 'physical_visit',
                    label: 'Physical Visit / Spot Check',
                    max_points: 5,
                    optional: true,
                    description: 'Instructor verification of student\'s physical presence at the station and validity of the logged activities.'
                }
            ]
        }
    ]
};
