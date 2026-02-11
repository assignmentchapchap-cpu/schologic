
export const DEMO_CLASS = {
    name: "Introduction to Marketing",
    class_code: "MKT101",
    start_date: "2026-01-01",
    end_date: "2026-03-26",
    settings: {
        grading_scale: "percentage",
        allow_late_submissions: true
    }
};

export const DEMO_STUDENT_PASSWORD = "DemoStudent123!";

// Permanent demo students (shared across all demo accounts)
export const DEMO_STUDENT_IDS = [
    "4aada96c-64dc-480a-9a5c-855f60f2e4ce", // Student 1 josphinenyambura@ku.ac.ke
    "f6b8c29c-1899-4445-8448-f99daab3ad53", // Student 2  jamesmuriuki@tibs.ac.ke
    "74129793-d7d0-4223-84b0-d634d173aa90", // Student 3 sharonwangari@gmail.com
    "56da66e4-e8fd-4ac3-8375-2e680e7af000", // Student 4 simonkibe@uon.ac.ke
    "d3098408-2fcf-4f9e-b6f3-90988f8b7001"  // Student 5 bettykyalo@mit.edu
];


export const DEMO_RESOURCES = [
    {
        title: "Lecture 1: The Marketing Mix (4 Ps)",
        content: "Summary of Lecture 1:\n\n1. product: What are you selling? Features vs Benefits.\n2. Price: Cost-plus, value-based, and competitive pricing strategies.\n3. Place: Distribution channels, logistics, and market coverage.\n4. Promotion: Advertising, PR, and sales promotion techniques.\n\nKey Takeaway: The 4 Ps must work together synergistically.",
    },
    {
        title: "Lecture 2: Understanding Consumer Behavior",
        content: "Summary of Lecture 2:\n\n- Maslow's Hierarchy of Needs applied to marketing.\n- The Consumer Decision Making Process: Recognition -> Search -> Evaluation -> Purchase -> Post-Purchase.\n- Psychological vs Social influences on buying patterns.\n\nReading: Chapter 3 of 'Marketing Management' by Kotler.",
    }
];

export const DEMO_STUDENTS = [
    { first: "Alex", last: "Rivera" }, { first: "Jordan", last: "Lee" }, { first: "Casey", last: "Smith" }, { first: "Taylor", last: "Wong" },
    { first: "Morgan", last: "Johnson" }, { first: "Riley", last: "Chen" }, { first: "Jamie", last: "Doe" }, { first: "Avery", last: "Brown" },
    { first: "Cameron", last: "Davis" }, { first: "Quinn", last: "Miller" }, { first: "Peyton", last: "Wilson" }, { first: "Skyler", last: "Moore" },
    { first: "Dakota", last: "Taylor" }, { first: "Reese", last: "Anderson" }, { first: "Finley", last: "Thomas" }, { first: "Hayden", last: "Jackson" },
    { first: "Sawyer", last: "White" }, { first: "Rowan", last: "Harris" }, { first: "Emerson", last: "Martin" }, { first: "Phoenix", last: "Thompson" }
];

export const DEMO_ASSIGNMENTS = [
    {
        title: "The 4 Ps of Marketing: Analysis",
        short_code: "A1",
        description: "Analyze the 4 Ps (Product, Price, Place, Promotion) of a brand of your choice. Ensure you cover each aspect in detail. Your essay should be between 300-500 words.",
        max_points: 30,
        due_date: "2026-01-15T23:59:00Z",
        word_count: 500,
        reference_style: "APA",
        rubric: {
            criteria: [
                { id: "c1", title: "Analysis Depth", weight: 40, max_points: 12, description: "Evaluates the comprehensiveness of the analysis for each of the 4 Ps (Product, Price, Place, Promotion)." },
                { id: "c2", title: "Examples", weight: 30, max_points: 9, description: "Assesses the relevance and specific detail of real-world examples used to support arguments." },
                { id: "c3", title: "Clarity & Grammar", weight: 30, max_points: 9, description: "Checks for clear writing style, logical flow, and absence of grammatical errors." }
            ]
        }
    },
    {
        title: "Digital Marketing Trends 2024",
        short_code: "A2",
        description: "Write a short report on the emerging digital marketing trends for 2024. Discuss impacts of AI, voice search, and personalization. Target length: 400-500 words.",
        max_points: 50,
        due_date: "2026-02-28T23:59:00Z",
        word_count: 500,
        reference_style: "Harvard",
        rubric: {
            criteria: [
                { id: "c1", title: "Trend Identification", weight: 40, max_points: 20, description: "Evaluates the correct identification and explanation of key trends (AI, Voice Search, Personalization)." },
                { id: "c2", title: "Analysis & Implication", weight: 40, max_points: 20, description: "Assesses the depth of discussion regarding how these trends will impact the marketing industry." },
                { id: "c3", title: "Writing Quality", weight: 20, max_points: 10, description: "Evaluates the overall structure, paragraph flow, and adherence to academic writing standards." }
            ]
        }
    },
    {
        title: "Marketing Fundamentals Quiz",
        short_code: "Q1",
        description: "Test your knowledge of the core concepts covered in the first module. This quiz covers the 4 Ps, consumer behavior, and market segmentation.",
        max_points: 20,
        due_date: "2026-01-20T23:59:00Z",
        assignment_type: "quiz",
        rubric: {
            questions: [
                {
                    id: "q1",
                    text: "Which of the following is NOT one of the 4 Ps of Marketing?",
                    type: "multiple_choice",
                    points: 5,
                    options: [
                        "Product",
                        "Price",
                        "Profit",
                        "Promotion"
                    ],
                    correctAnswer: "Profit"
                },
                {
                    id: "q2",
                    text: "What is the first stage of the Consumer Decision Making Process?",
                    type: "multiple_choice",
                    points: 5,
                    options: [
                        "Information Search",
                        "Problem Recognition",
                        "Purchase Decision",
                        "Post-purchase Evaluation"
                    ],
                    correctAnswer: "Problem Recognition"
                },
                {
                    id: "q3",
                    text: "Which pricing strategy involves setting a high price for a new product to skim revenues layer by layer?",
                    type: "multiple_choice",
                    points: 5,
                    options: [
                        "Market Penetration Pricing",
                        "Market Skimming Pricing",
                        "Cost-plus Pricing",
                        "Competitive Pricing"
                    ],
                    correctAnswer: "Market Skimming Pricing"
                },
                {
                    id: "q4",
                    text: "Which of these is a demographic segmentation variable?",
                    type: "multiple_choice",
                    points: 5,
                    options: [
                        "Lifestyle",
                        "Personality",
                        "Age",
                        "Usage Rate"
                    ],
                    correctAnswer: "Age"
                }
            ]
        }
    }
];

export const DEMO_SUBMISSION_TEXT_1 = `The marketing mix, commonly referred to as the 4 Ps—Product, Price, Place, and Promotion—is a foundational framework for any marketing strategy. In this analysis, I will examine how Nike Inc. utilizes these four elements to maintain its dominance in the global sportswear market.

Product:
Nike’s product strategy centers on innovation and quality. They offer a diverse range of products including footwear, apparel, and equipment. A key aspect of their product strategy is the heavy investment in Research and Development (R&D) to create cutting-edge technology like Air Max and Flyknit. This focus on performance and style ensures they cater to both professional athletes and fashion-conscious consumers, effectively differentiating themselves from competitors like Adidas or Puma.

Price:
Nike employs a value-based pricing strategy, often positioning itself as a premium brand. While their costs of production were originally low, the perceived value of the "Swoosh" logo allows them to command higher prices. They also use a skimming strategy for new releases, launching limited-edition sneakers at high prices to capitalize on hype before potentially lowering prices or introducing mid-range alternatives. This pricing reinforces the brand's image of exclusivity and high quality.

Place:
Nike’s distribution strategy is omnichannel. They utilize a mix of direct-to-consumer (DTC) channels, such as their website and Nike Town flagship stores, and retail partnerships with stores like Foot Locker. Recently, Nike has shifted more aggressively towards DTC sales to control the customer experience and improve margins. Their global presence ensures that their products are accessible in almost every major market, from urban centers in New York to rural towns in developing nations.

Promotion:
Nike is arguably most famous for its promotion. Their "Just Do It" campaign is iconic. They rely heavily on celebrity endorsements, sponsoring top athletes like LeBron James, Cristiano Ronaldo, and Serena Williams. These partnerships create an aspirational connection with the consumer. Furthermore, Nike’s digital marketing is robust, leveraging social media to build community and engage with younger demographics through storytelling rather than just hard selling.

In conclusion, Nike’s mastery of the 4 Ps allows them to stay ahead. By balancing premium innovative products with strategic pricing, vast availability, and emotionally resonant promotion, they maintain a powerful brand equity that is difficult to replicate.`;

export const DEMO_SUBMISSION_TEXT_2 = `As we move into 2024, the digital marketing landscape is undergoing a seismic shift driven by technological advancements. Three key trends are defining this era: the integration of Artificial Intelligence (AI), the rise of Voice Search, and Hyper-Personalization.

First and foremost, Artificial Intelligence is no longer just a buzzword; it is a core utility. Generative AI tools like ChatGPT and Midjourney are revolutionizing content creation, allowing marketers to produce copy and visuals at unprecedented speed. However, the implication is a saturated content market, where quality and human insight become the new premium. AI is also powering predictive analytics, enabling brands to forecast consumer behavior with high accuracy, thus optimizing ad spend in real-time.

Secondly, Voice Search optimization is becoming critical. With the proliferation of smart speakers like Amazon Alexa and Google Home, consumers are increasingly searching using natural language. "What is the best running shoe?" is replacing keywords like "best running shoe". Marketers must adapt by optimizing content for conversational queries and long-tail keywords. This trend favors brands that provide direct, concise answers that voice assistants can easily read aloud.

Finally, Hyper-Personalization is evolving beyond just using a customer's first name in an email. In 2024, it means delivering dynamic website experiences and product recommendations based on real-time behavior. For instance, an e-commerce site might change its homepage layout based on a user's past browsing history. This level of tailoring increases conversion rates but also raises concerns about data privacy. Brands must balance personalization with transparency to maintain trust.

In summary, 2024 is the year of smart, adaptive marketing. Success depends on leveraging AI for efficiency, optimizing for voice for accessibility, and personalized experiences for engagement. Companies that fail to adapt to these trends risk becoming obsolete in an increasingly automated and user-centric digital ecosystem.`;

// Pre-filled AI Reports for immediate "Graded" status
export const DEMO_AI_REPORTS = {
    assignment1_good: {
        score: 26, // Grade: 26/30 (86%)
        ai_probability: 12, // Low Risk
        strengths: [
            "Excellent breakdown of each of the 4 Ps with specific examples.",
            "Strong understanding of Nike's specific strategies (e.g., DTC shift).",
            "Clear and professional writing style."
        ],
        weaknesses: [
            "Could benefit from a deeper comparison with a competitor to highlight effectiveness.",
            "The pricing section could mention specific price points for context."
        ],
        next_steps: [
            "Include a brief competitive analysis in future essays.",
            "Incorporate quantitative data to support claims about market dominance."
        ],
        rubric_breakdown: [
            { criterion: "Analysis Depth", score: 10, max: 12, performance_level: "Good" },
            { criterion: "Examples", score: 8, max: 9, performance_level: "Excellent" },
            { criterion: "Clarity & Grammar", score: 8, max: 9, performance_level: "Excellent" }
        ],
        segments: [
            { text: "The marketing mix, commonly referred to as the 4 Ps—Product, Price, Place, and Promotion—is a foundational framework for any marketing strategy. In this analysis, I will examine how Nike Inc. utilizes these four elements to maintain its dominance in the global sportswear market.", prob: 0.12, isFlagged: false },
            { text: "Product:\nNike’s product strategy centers on innovation and quality. They offer a diverse range of products including footwear, apparel, and equipment. A key aspect of their product strategy is the heavy investment in Research and Development (R&D) to create cutting-edge technology like Air Max and Flyknit. This focus on performance and style ensures they cater to both professional athletes and fashion-conscious consumers, effectively differentiating themselves from competitors like Adidas or Puma.", prob: 0.15, isFlagged: false },
            { text: "Price:\nNike employs a value-based pricing strategy, often positioning itself as a premium brand. While their costs of production were originally low, the perceived value of the \"Swoosh\" logo allows them to command higher prices. They also use a skimming strategy for new releases, launching limited-edition sneakers at high prices to capitalize on hype before potentially lowering prices or introducing mid-range alternatives. This pricing reinforces the brand's image of exclusivity and high quality.", prob: 0.08, isFlagged: false },
            { text: "Place:\nNike’s distribution strategy is omnichannel. They utilize a mix of direct-to-consumer (DTC) channels, such as their website and Nike Town flagship stores, and retail partnerships with stores like Foot Locker. Recently, Nike has shifted more aggressively towards DTC sales to control the customer experience and improve margins. Their global presence ensures that their products are accessible in almost every major market, from urban centers in New York to rural towns in developing nations.", prob: 0.11, isFlagged: false },
            { text: "Promotion:\nNike is arguably most famous for its promotion. Their \"Just Do It\" campaign is iconic. They rely heavily on celebrity endorsements, sponsoring top athletes like LeBron James, Cristiano Ronaldo, and Serena Williams. These partnerships create an aspirational connection with the consumer. Furthermore, Nike’s digital marketing is robust, leveraging social media to build community and engage with younger demographics through storytelling rather than just hard selling.", prob: 0.18, isFlagged: false },
            { text: "In conclusion, Nike’s mastery of the 4 Ps allows them to stay ahead. By balancing premium innovative products with strategic pricing, vast availability, and emotionally resonant promotion, they maintain a powerful brand equity that is difficult to replicate.", prob: 0.05, isFlagged: false }
        ]
    },
    assignment2_average: {
        score: 38, // Grade: 38/50 (76%)
        ai_probability: 88, // High Risk
        strengths: [
            "Identifies three highly relevant trends for 2024.",
            "Good logical flow from one point to the next.",
            "Clear introduction and conclusion."
        ],
        weaknesses: [
            "Lacks specific citations or references to industry reports.",
            "Analysis of 'Implications' is somewhat brief for the AI section."
        ],
        next_steps: [
            "Support your claims with data or quotes from industry leaders.",
            "Expand on the ethical implications of AI in marketing."
        ],
        rubric_breakdown: [
            { criterion: "Trend Identification", score: 18, max: 20, performance_level: "Excellent" },
            { criterion: "Analysis & Implication", score: 14, max: 20, performance_level: "Good" },
            { criterion: "Writing Quality", score: 6, max: 10, performance_level: "Average" }
        ],
        segments: [
            { text: "As we move into 2024, the digital marketing landscape is undergoing a seismic shift driven by technological advancements. Three key trends are defining this era: the integration of Artificial Intelligence (AI), the rise of Voice Search, and Hyper-Personalization.", prob: 0.85, isFlagged: true },
            { text: "First and foremost, Artificial Intelligence is no longer just a buzzword; it is a core utility. Generative AI tools like ChatGPT and Midjourney are revolutionizing content creation, allowing marketers to produce copy and visuals at unprecedented speed. However, the implication is a saturated content market, where quality and human insight become the new premium. AI is also powering predictive analytics, enabling brands to forecast consumer behavior with high accuracy, thus optimizing ad spend in real-time.", prob: 0.95, isFlagged: true },
            { text: "Secondly, Voice Search optimization is becoming critical. With the proliferation of smart speakers like Amazon Alexa and Google Home, consumers are increasingly searching using natural language. \"What is the best running shoe?\" is replacing keywords like \"best running shoe\". Marketers must adapt by optimizing content for conversational queries and long-tail keywords. This trend favors brands that provide direct, concise answers that voice assistants can easily read aloud.", prob: 0.45, isFlagged: false },
            { text: "Finally, Hyper-Personalization is evolving beyond just using a customer's first name in an email. In 2024, it means delivering dynamic website experiences and product recommendations based on real-time behavior. For instance, an e-commerce site might change its homepage layout based on a user's past browsing history. This level of tailoring increases conversion rates but also raises concerns about data privacy. Brands must balance personalization with transparency to maintain trust.", prob: 0.88, isFlagged: true },
            { text: "In summary, 2024 is the year of smart, adaptive marketing. Success depends on leveraging AI for efficiency, optimizing for voice for accessibility, and personalized experiences for engagement. Companies that fail to adapt to these trends risk becoming obsolete in an increasingly automated and user-centric digital ecosystem.", prob: 0.92, isFlagged: true }
        ]
    }
};

// ============================================
// PRACTICUM DEMO DATA
// ============================================

export const DEMO_PRACTICUM = {
    title: "Teaching Practice - Spring 2026",
    cohort_code: "TP-SPR26",
    invite_code: "TEACH2026",
    start_date: "2026-02-01",
    end_date: "2026-05-30",
    log_interval: "weekly",
    auto_approve: true,
    geolocation_required: false,
    final_report_required: true,
    log_template: "teaching_practice",

    logs_rubric: {
        id: 'demo_logs_assessment',
        title: 'PRACTICUM LOGS ASSESSMENT RUBRIC',
        total_marks: 20,
        sections: [
            {
                id: 'timeliness',
                title: 'SECTION 1: TIMELINESS & CONSISTENCY',
                description: 'Assessment of submission schedule adherence',
                criteria: [
                    {
                        id: 'submission_adherence',
                        label: 'Timeliness of Submission',
                        max_points: 5,
                        description: 'Consistently submits log entries on time'
                    }
                ]
            },
            {
                id: 'content_quality',
                title: 'SECTION 2: CONTENT QUALITY & REFLECTION',
                description: 'Evaluation of depth and relevance',
                criteria: [
                    {
                        id: 'insight',
                        label: 'Insight & Reflection',
                        max_points: 8,
                        description: 'Demonstrates deep reflection on learning experiences'
                    },
                    {
                        id: 'application',
                        label: 'Practical Application',
                        max_points: 5,
                        description: 'Evidence of applying skills in practice'
                    }
                ]
            },
            {
                id: 'professionalism',
                title: 'SECTION 3: PROFESSIONAL CONDUCT',
                description: 'Assessment of professional standards',
                criteria: [
                    {
                        id: 'professionalism',
                        label: 'Professionalism in Reporting',
                        max_points: 2,
                        description: 'Professional language and accurate data'
                    }
                ]
            }
        ]
    },

    supervisor_report_template: {
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
                category: "PERSONAL ATTRIBUTES",
                attributes: [
                    {
                        id: "i",
                        attribute: "Punctuality",
                        description: "Arrival at school, meetings, class & assigned duties"
                    },
                    {
                        id: "ii",
                        attribute: "Professional Dress",
                        description: "Modesty in dress code as per regulations"
                    }
                ]
            },
            {
                category: "CORE COMPETENCIES",
                attributes: [
                    {
                        id: "i",
                        competency: "Communication and collaboration",
                        description: "Speaks clearly, shows confidence, teamwork"
                    },
                    {
                        id: "ii",
                        competency: "Teaching Skills",
                        description: "Effective lesson delivery and student engagement"
                    },
                    {
                        id: "iii",
                        competency: "Classroom Management",
                        description: "Maintains discipline and learning environment"
                    },
                    {
                        id: "iv",
                        competency: "Creativity and imagination",
                        description: "Able to improvise solutions, Focused, curious, generates new ideas"
                    },
                    {
                        id: "v",
                        competency: "Critical thinking and problem solving",
                        description: "Solves problems, offers alternative solutions, pays attention to detail"
                    },
                    {
                        id: "vi",
                        competency: "Digital literacy",
                        description: "Uses technology effectively in teaching, operates educational software"
                    },
                    {
                        id: "vii",
                        competency: "Self-efficacy",
                        description: "Shows interest in learning, resilient, embraces challenges, persistent"
                    },
                    {
                        id: "viii",
                        competency: "Learning to learn",
                        description: "Is organized, self-disciplined, adjusts to school dynamics effectively"
                    }
                ]
            }
        ],
        total_score: 50
    },

    student_report_template: {
        title: "PRACTICUM REPORT SCORE SHEET",
        sections: [
            {
                item_number: 1,
                section: "COVER PAGE",
                details: "Identification details",
                marks: 1
            },
            {
                item_number: 2,
                section: "PRELIMINARY PAGES",
                total_marks: 6,
                subsections: [
                    { title: "Declaration page", marks: 0.5 },
                    { title: "Acknowledgement", marks: 0.5 },
                    { title: "Dedication", marks: 0.5 },
                    { title: "Table of contents", marks: 1 },
                    { title: "List of tables", marks: 0.5 },
                    { title: "List of figures", marks: 0.5 },
                    { title: "List of abbreviation and acronyms", marks: 0.5 },
                    { title: "Definition of terms", marks: 1 },
                    { title: "Executive Summary", marks: 1 }
                ]
            },
            {
                item_number: 3,
                section: "SECTION 1: INTRODUCTION: School/company Profile",
                total_marks: 6,
                subsections: [
                    { id: "1.1", title: "Geographical location", marks: 1 },
                    { id: "1.2", title: "Historical background", marks: 1 },
                    { id: "1.3", title: "Vision", marks: 1 },
                    { id: "1.4", title: "Mission", marks: 1 },
                    { id: "1.5", title: "Core values", marks: 1 },
                    { id: "1.6", title: "School/organization structure", marks: 1 }
                ]
            },
            {
                item_number: 4,
                section: "SECTION 2: PRACTICUM EXPERIENCES",
                total_marks: 10,
                subsections: [
                    { id: "2.1", title: "Purpose and learning outcomes", marks: 1.5 },
                    { id: "2.2", title: "Specific activities undertaken", marks: 1.5 },
                    { id: "2.3", title: "Analysis of knowledge and skills applied", marks: 3 },
                    { id: "2.4", title: "Skills and competencies gained", marks: 1.5 },
                    { id: "2.5", title: "Observations and critique", marks: 2.5 }
                ]
            },
            {
                item_number: 5,
                section: "SECTION 3: CONCLUSION",
                total_marks: 5,
                subsections: [
                    { id: "3.1", title: "Summary", marks: 2 },
                    { id: "3.2", title: "Conclusion", marks: 1.5 },
                    { id: "3.3", title: "Recommendations", marks: 1.5 }
                ]
            },
            {
                item_number: 6,
                section: "REFERENCES",
                details: "Citation of sources used in report",
                marks: 1
            },
            {
                item_number: 7,
                section: "APPENDICES",
                details: "Relevant attachments (logbook, charts, etc.)",
                marks: 1
            }
        ],
        total_report_marks: 30
    },

    grading_config: {
        logs_weight: 30,
        report_weight: 30,
        supervisor_weight: 40
    },

    timeline: {
        milestones: [
            { date: "2026-02-01", title: "Practicum Begins" },
            { date: "2026-05-15", title: "Supervisor Evaluation Due" },
            { date: "2026-05-30", title: "Final Report Due" }
        ]
    }
};

// CORRECTED: Weekly logs must have a 'days' array with 5 daily entries
// Replace DEMO_LOG_ENTRIES in demo-data.ts with this version

export const DEMO_LOG_ENTRIES = [
    {
        week: "2026-02-03",
        status: "read",
        weekly_reflection: "This week focused on introducing quadratic equations through factorization. Initial hesitation turned into engagement through group activities. Breaking concepts into smaller steps and using peer teaching significantly improved comprehension. Will continue this approach.",
        entries: {
            days: [
                {
                    date: "2026-02-03",
                    office_activities: "Attended weekly staff meeting",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Introduction to Quadratic Equations - Basics",
                    observations: "Introduced the concept of quadratic equations. Students seemed curious but hesitant.",
                    supervisor_notes: "Good introduction. Keep momentum."
                },
                {
                    date: "2026-02-04",
                    office_activities: "Prepared teaching aids",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Factorization Method",
                    observations: "Students struggled with factorization. Provided additional practice problems.",
                    supervisor_notes: "Consider using visual aids."
                },
                {
                    date: "2026-02-05",
                    office_activities: "Reviewed student homework",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Factorization Practice",
                    observations: "Group work helped. Students explaining to each other improved understanding significantly.",
                    supervisor_notes: "Great use of peer learning."
                },
                {
                    date: "2026-02-06",
                    office_activities: "Graded quizzes",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Solving Quadratics by Factorization",
                    observations: "About 80% of students can now solve basic problems. Need more practice with complex ones.",
                    supervisor_notes: "Good progress tracking."
                },
                {
                    date: "2026-02-07",
                    office_activities: "Prepared lesson materials for next week",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Review and Assessment",
                    observations: "Quick review session. Most students showing improvement. Breaking down complex topics helped.",
                    supervisor_notes: "Excellent pacing throughout the week."
                }
            ]
        }
    },
    {
        week: "2026-02-10",
        status: "read",
        weekly_reflection: "Completing the square proved challenging initially but peer teaching strategies worked exceptionally well. Students retain material better when explaining to classmates. The collaborative environment created this week will be valuable going forward.",
        entries: {
            days: [
                {
                    date: "2026-02-10",
                    office_activities: "Organized resources for completing the square",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Completing the Square - Introduction",
                    observations: "Introduced completing the square method. Students needed time to understand the concept.",
                    supervisor_notes: "Clear explanation."
                },
                {
                    date: "2026-02-11",
                    office_activities: "Created practice worksheets",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Completing the Square - Step by Step",
                    observations: "Step-by-step demonstration helped. Students practiced with guidance.",
                    supervisor_notes: "Good scaffolding approach."
                },
                {
                    date: "2026-02-12",
                    office_activities: "Marked homework assignments",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Completing the Square - Practice",
                    observations: "Peer teaching session very effective. Students teaching each other created collaborative environment.",
                    supervisor_notes: "Excellent student interaction."
                },
                {
                    date: "2026-02-13",
                    office_activities: "Prepared assessment materials",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Real-world Applications",
                    observations: "Connected completing the square to real problems. High engagement when discussing practical uses.",
                    supervisor_notes: "Strong improvement in facilitation."
                },
                {
                    date: "2026-02-14",
                    office_activities: "Reviewed student progress",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Week Review",
                    observations: "Most students mastered the technique. Time management issue - extended lesson into next day.",
                    supervisor_notes: "Overall excellent week."
                }
            ]
        }
    },
    {
        week: "2026-02-17",
        status: "read",
        weekly_reflection: "The quadratic formula week went very well. Real-world applications (physics and business) significantly boosted student motivation and engagement. Students now understand when to use each solving method and can apply them appropriately.",
        entries: {
            days: [
                {
                    date: "2026-02-17",
                    office_activities: "Prepared quadratic formula materials",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Quadratic Formula - Introduction",
                    observations: "Introduced the formula. Students compared it with previous methods.",
                    supervisor_notes: "Good comparison approach."
                },
                {
                    date: "2026-02-18",
                    office_activities: "Created practice problems",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Quadratic Formula - Practice",
                    observations: "Students practiced applying the formula. Some calculation errors - emphasized double-checking.",
                    supervisor_notes: "Good emphasis on accuracy."
                },
                {
                    date: "2026-02-19",
                    office_activities: "Graded assignments",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Real-world Applications - Projectile Motion",
                    observations: "High interest in physics applications. Connecting math to real scenarios increased motivation.",
                    supervisor_notes: "Excellent real-world examples."
                },
                {
                    date: "2026-02-20",
                    office_activities: "Prepared business examples",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Real-world Applications - Profit Optimization",
                    observations: "Students fascinated by business applications. Strong engagement throughout lesson.",
                    supervisor_notes: "Outstanding use of practical examples."
                },
                {
                    date: "2026-02-21",
                    office_activities: "Prepared review materials",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Choosing the Right Method",
                    observations: "Taught students when to use each method. Most can now identify appropriate technique for each problem type.",
                    supervisor_notes: "Comprehensive week."
                }
            ]
        }
    },
    {
        week: "2026-02-24",
        status: "unread",
        weekly_reflection: "Review week proved valuable. Game-based learning increased engagement significantly. Students consolidated their learning and most demonstrated mastery. Will incorporate more competitive elements in future review sessions.",
        entries: {
            days: [
                {
                    date: "2026-02-24",
                    office_activities: "Created review games",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Review - All Methods",
                    observations: "Review games created high engagement. Competition motivated participation.",
                    supervisor_notes: ""
                },
                {
                    date: "2026-02-25",
                    office_activities: "Prepared practice tests",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Practice Assessment",
                    observations: "Students completed practice test. Identified areas needing reinforcement.",
                    supervisor_notes: ""
                },
                {
                    date: "2026-02-26",
                    office_activities: "One-on-one support sessions",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Targeted Support",
                    observations: "Worked individually with struggling students. Most confusion cleared up.",
                    supervisor_notes: ""
                },
                {
                    date: "2026-02-27",
                    office_activities: "Final review preparation",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Comprehensive Review",
                    observations: "Final review session. Students demonstrated solid understanding of all three methods.",
                    supervisor_notes: ""
                },
                {
                    date: "2026-02-28",
                    office_activities: "Assessment administration",
                    class_taught: "Form 3B",
                    subject_taught: "Mathematics",
                    lesson_topic: "Unit Assessment",
                    observations: "Administered unit test. Students approached it confidently. Few students still confused about method selection.",
                    supervisor_notes: ""
                }
            ],
        }
    }
];

// Sample Supervisor Reports (2 completed evaluations)
export const DEMO_SUPERVISOR_REPORTS = [
    {
        student_id: "4aada96c-64dc-480a-9a5c-855f60f2e4ce", // Josephine Nyambura
        submitted_at: "2026-02-20T10:30:00Z",
        total_score: 42,
        max_total_score: 50,
        sections: [
            {
                id: "personal_attributes",
                title: "PERSONAL ATTRIBUTES",
                items: [
                    {
                        id: "punctuality",
                        label: "Punctuality",
                        value: 5,
                        max_score: 5
                    },
                    {
                        id: "dress_code",
                        label: "Professional Dress",
                        value: 4,
                        max_score: 5
                    }
                ]
            },
            {
                id: "core_competencies",
                title: "CORE COMPETENCIES",
                items: [
                    {
                        id: "communication",
                        label: "Communication and Collaboration",
                        value: 5,
                        max_score: 5
                    },
                    {
                        id: "teaching_skills",
                        label: "Teaching Skills",
                        value: 4,
                        max_score: 5
                    },
                    {
                        id: "classroom_management",
                        label: "Classroom Management",
                        value: 5,
                        max_score: 5
                    },
                    {
                        id: "creativity",
                        label: "Creativity and Imagination",
                        value: 4,
                        max_score: 5
                    },
                    {
                        id: "critical_thinking",
                        label: "Critical Thinking and Problem Solving",
                        value: 5,
                        max_score: 5
                    },
                    {
                        id: "digital_literacy",
                        label: "Digital Literacy",
                        value: 5,
                        max_score: 5
                    },
                    {
                        id: "self_efficacy",
                        label: "Self-Efficacy",
                        value: 5,
                        max_score: 5
                    }
                ]
            }
        ],
        feedback: "Josephine has demonstrated exceptional teaching skills throughout the practicum period. Her lesson delivery is clear, engaging, and well-structured. She shows excellent rapport with students and maintains strong classroom discipline. Her use of technology in teaching is commendable, particularly in creating interactive presentations. The students respond very positively to her teaching methods.\n\nAreas for improvement: Continue developing confidence in handling unexpected classroom situations.",
        recommendation: "Highly recommended for teaching profession. Josephine has shown outstanding performance and is well-prepared to transition into full-time teaching."
    },
    {
        student_id: "f6b8c29c-1899-4445-8448-f99daab3ad53", // James Muriuki
        submitted_at: "2026-02-21T14:45:00Z",
        total_score: 38,
        max_total_score: 50,
        sections: [
            {
                id: "personal_attributes",
                title: "PERSONAL ATTRIBUTES",
                items: [
                    {
                        id: "punctuality",
                        label: "Punctuality",
                        value: 4,
                        max_score: 5
                    },
                    {
                        id: "dress_code",
                        label: "Professional Dress",
                        value: 5,
                        max_score: 5
                    }
                ]
            },
            {
                id: "core_competencies",
                title: "CORE COMPETENCIES",
                items: [
                    {
                        id: "communication",
                        label: "Communication and Collaboration",
                        value: 4,
                        max_score: 5
                    },
                    {
                        id: "teaching_skills",
                        label: "Teaching Skills",
                        value: 4,
                        max_score: 5
                    },
                    {
                        id: "classroom_management",
                        label: "Classroom Management",
                        value: 3,
                        max_score: 5
                    },
                    {
                        id: "creativity",
                        label: "Creativity and Imagination",
                        value: 4,
                        max_score: 5
                    },
                    {
                        id: "critical_thinking",
                        label: "Critical Thinking and Problem Solving",
                        value: 4,
                        max_score: 5
                    },
                    {
                        id: "digital_literacy",
                        label: "Digital Literacy",
                        value: 5,
                        max_score: 5
                    },
                    {
                        id: "self_efficacy",
                        label: "Self-Efficacy",
                        value: 5,
                        max_score: 5
                    }
                ]
            }
        ],
        feedback: "James has shown good progress throughout the practicum. His technical knowledge is solid and he demonstrates good understanding of subject matter. He is punctual and maintains professional appearance. Students appreciate his patient approach to explaining difficult concepts.\n\nAreas for improvement: Needs to work on classroom management skills, particularly in maintaining discipline during group activities. Should be more assertive when managing disruptive behavior. Time management during lessons could also be improved.",
        recommendation: "Recommended for teaching profession with continued mentorship. James shows good potential and with more experience in classroom management, he will become a capable educator."
    }
];
