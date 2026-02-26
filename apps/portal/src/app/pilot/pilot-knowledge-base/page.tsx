import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PilotNavbarSimple } from '@/components/pilot/PilotNavbarSimple';
import { JsonLdWebPage, JsonLdBreadcrumbList } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
    title: 'Knowledge Base | Schologic LMS Pilot Management',
    description: 'Master the Schologic LMS Pilot Management Portal. Detailed documentation on platform overview, application processes, team collaboration, and institutional configuration.',
    keywords: [
        'LMS Pilot Management',
        'Schologic Knowledge Base',
        'Institutional LMS Deployment',
        'AI Grading Documentation',
        'Academic Integrity Software Kenya',
        'TVET Digital Transformation',
        'OER Integration Guide',
        'learning management kenya',
        'free institutional pilot',
        'custom lms'
    ],
    alternates: {
        canonical: 'https://pilot.schologic.com/pilot-knowledge-base',
    }
};

export default function PilotKnowledgeBase() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <PilotNavbarSimple />

            <JsonLdWebPage
                name="Schologic LMS Pilot Knowledge Base"
                description="Comprehensive documentation for the Schologic LMS Pilot Management Portal, covering deployment, configuration, and evaluation."
                url="https://pilot.schologic.com/pilot-knowledge-base"
            />
            <JsonLdBreadcrumbList
                items={[
                    { name: 'Pilot Portal', item: 'https://pilot.schologic.com/' },
                    { name: 'Knowledge Base', item: 'https://pilot.schologic.com/pilot-knowledge-base' }
                ]}
            />

            {/* Content Container */}
            <main className="pt-32 pb-24 max-w-4xl mx-auto px-6">
                <article className="prose prose-slate prose-indigo max-w-none">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-6 tracking-tight leading-tight uppercase">
                            Knowledge Base
                        </h1>
                        <p className="text-slate-500 font-sans font-light text-lg">Schologic LMS: Pilot Management Portal Documentation</p>
                    </div>
                    <div className="bg-slate-50 rounded-3xl p-8 mb-16 border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-700">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <span className="w-8 h-px bg-slate-300"></span>
                            Table of Contents
                        </h2>
                        <nav className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            {[
                                { id: 'platform-overview', title: 'Platform Overview' },
                                { id: 'application-process', title: 'The Application Process' },
                                { id: 'team-collaboration', title: 'Team Collaboration' },
                                { id: 'pilot-architect', title: 'LMS Customization' },
                                { id: 'branding-config', title: 'Branding & Setup' },
                                { id: 'evaluation-phase', title: 'Evaluation & Transition' },
                            ].map((item, idx) => (
                                <Link
                                    key={item.id}
                                    href={`#${item.id}`}
                                    className="group flex items-center gap-4 text-slate-600 hover:text-indigo-600 transition-all duration-300"
                                >
                                    <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-indigo-400 transition-colors">0{idx + 1}</span>
                                    <span className="text-sm font-medium tracking-tight">{item.title}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="space-y-16 text-slate-700 leading-relaxed font-light">
                        {/* 1. Platform Overview */}
                        <section id="platform-overview">
                            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-8 pt-8 border-t border-slate-100 italic">1. Platform Overview: The LMS Pilot Advantage for Institutional Growth</h2>

                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-slate-900">What is a Schologic Pilot?</h3>
                                <p>
                                    A Schologic Pilot is a fully functional, zero-risk deployment of the Schologic LMS tailored specifically to your institution's unique environment, establishing Schologic as the premier <strong>LMS in Kenya</strong> for academic transformation. Rather than relying on generic software demonstrations, a pilot allows your faculty, IT staff, and students to experience Schologic's AI-powered academic integrity tools, automated grading, and Open Educational Resources (OER) in a live, secure sandbox.
                                </p>
                                <p>
                                    Our goal during the pilot is to definitively prove our core promises: reducing grading time by up to 80%, eliminating textbook costs through integrated OER (LibreTexts/OpenStax), and ensuring absolute academic integrity through granular <Link href="/features/ai-detection" className="text-indigo-600 hover:underline">AI forensics</Link> and <Link href="/features/ai-detection" className="text-indigo-600 hover:underline">academic integrity software</Link>.
                                </p>

                                <h3 className="text-xl font-bold text-slate-900">Why a Digitized Pilot Management Portal (PMP)?</h3>
                                <p>
                                    Traditionally, adopting an enterprise Learning Management System requires months of fragmented email threads, repetitive physical meetings, and misaligned expectations between IT, Academics, and Instructors.
                                </p>
                                <p>
                                    We built the <strong>Schologic Pilot Management Portal (<code>pilot.schologic.com</code>)</strong> to revolutionize this process, specifically optimized as the <strong>best LMS for universities</strong> and colleges in the East African region.
                                </p>

                                <p className="font-bold">Benefits of the Digitized Portal for Your Institution:</p>
                                <ol className="list-decimal pl-5 space-y-4">
                                    <li><strong>Eliminates Fragmented Communication:</strong> No more lost emails. All deployment tasks, course migration documentation, and academic requirements are housed in a single secure workspace accessible to your entire decision-making committee.</li>
                                    <li><strong>Asynchronous Scoping:</strong> Design your ideal LMS environment at your own pace without waiting to schedule physical scoping meetings.</li>
                                    <li><strong>Instant ROI Blueprints:</strong> As you configure your pilot needs, the system automatically translates your inputs into a tangible Business Case and ROI Estimate that you can immediately present to your Vice Chancellor or Board.</li>
                                    <li><strong>Transparent Project Tracking:</strong> See exactly where you are in the deployment phase, from server provisioning to IMSCC course migration, in real-time.</li>
                                </ol>

                                <h3 className="text-xl font-bold text-slate-900 mt-12">Tailored Pathways by Institution Type</h3>
                                <p>
                                    Schologic recognizes that different institutions face vastly different operational challenges. The pilot process automatically adapts to your context through specialized <Link href="/use-cases" className="text-indigo-600 hover:underline">Use Cases</Link>:
                                </p>
                                <ul className="space-y-4 list-disc pl-5">
                                    <li><strong>For <Link href="/use-cases/universities" className="text-indigo-600 hover:underline">Universities</Link>:</strong> Designed to protect academic integrity with AI-resistant assessment and large-scale data sovereignty. Focuses heavily on AI Forensics (RoBERTa models) and on-premise compliance.</li>
                                    <li><strong>For <Link href="/use-cases/tvet" className="text-indigo-600 hover:underline">TVET Institutions</Link>:</strong> Built for competency-based assessment and industry-linked skill tracking. Designed to meet rigorous <strong>CDACC compliance</strong> standards and <strong>CBET alignment</strong> while fully digitizing logbooks and supervisor evaluations through the <Link href="/features/practicum-manager" className="text-indigo-600 hover:underline">Practicum Manager</Link> to ensure 100% compliance.</li>
                                    <li><strong>For <Link href="/use-cases/colleges" className="text-indigo-600 hover:underline">Colleges</Link>:</strong> Helps you transition to digital with zero textbook costs and unified management. Prioritizes the Resource Library, allowing you to import IMSCC common cartridges to provide high-quality OER textbooks to your student body.</li>
                                </ul>

                                <h3 className="text-xl font-bold text-slate-900 mt-12">The Pilot Lifecycle</h3>
                                <p>Your journey through the Pilot Management Portal follows four distinct phases:</p>
                                <ol className="list-decimal pl-5 space-y-4">
                                    <li><strong>Application & Verification:</strong> The institutional champion submits a secure request using an official university/college email.</li>
                                    <li><strong>Design & Configuration:</strong> The champion invites their committee, selects desired modules, sets success KPIs, and white-labels the dashboard.</li>
                                    <li><strong>Technical Deployment:</strong> Schologic provisions the custom tenant, synchronizes automated tasks (e.g., IMSCC course migration), and activates the environment.</li>
                                    <li><strong>Evaluation & Transition:</strong> We track your specific KPIs (e.g., grading hours saved, AI plagiarism dropped) and generate a final evaluation report for transition to an enterprise license.</li>
                                </ol>
                            </div>
                        </section>

                        {/* 2. The Application Process */}
                        <section id="application-process">
                            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-8 pt-8 border-t border-slate-100">2. The Application Process</h2>
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-slate-900">Who Should Apply?</h3>
                                <p>The pilot application should be initiated by an <strong>Institutional Champion</strong>. This is typically an individual with the mandate to explore digital transformation and academic quality assurance. Common champions include:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Head of Department (HOD)</li>
                                    <li>Dean of Academics / Registrar</li>
                                    <li>Director of E-Learning / ICT</li>
                                    <li>TVET Principal</li>
                                </ul>
                                <p>The champion acts as the primary Super Admin for the Pilot Portal, holding the authority to invite other committee members and approve final configurations.</p>

                                <h3 className="text-xl font-bold text-slate-900 mt-12">The Institutional Email Requirement</h3>
                                <p>
                                    <strong>Important:</strong> To ensure the highest level of enterprise security and to comply with the Kenya Data Protection Act, <strong>Schologic strictly requires the use of official institutional email addresses</strong> (e.g., <code>jdoe@strathmore.edu</code>, <code>registrar@uonbi.ac.ke</code>, <code>ict@rvtti.ac.ke</code>) to initiate a pilot.
                                </p>

                                <p className="font-bold">Why do we reject public domains (Gmail, Yahoo, Outlook)?</p>
                                <ol className="list-decimal pl-5 space-y-4">
                                    <li><strong>Data Sovereignty & Security:</strong> We provision dedicated server resources and handle sensitive academic integrity data. We must verify that the applicant is an authorized representative of the institution.</li>
                                    <li><strong>Automated Provisioning:</strong> Our system uses your institutional domain to automatically map your deployment, pull public profile data to assist our support team, and prevent unauthorized sandbox generation.</li>
                                    <li><strong>Spam Prevention:</strong> It ensures our engineering team dedicates their bandwidth exclusively to qualified educational partners.</li>
                                </ol>

                                <h3 className="text-xl font-bold text-slate-900 mt-12">Step-by-Step Application Workflow</h3>
                                <p className="font-bold">Step 1: Account Creation</p>
                                <ol className="list-decimal pl-5 space-y-2">
                                    <li>Navigate to <code>pilot.schologic.com</code>.</li>
                                    <li>Enter your full name, role, institution name, and official institutional email.</li>
                                    <li>Select your core institution type (University, TVET, or College).</li>
                                    <li>Click <strong>Request Pilot Access</strong>.</li>
                                </ol>

                                <p className="font-bold mt-8">Step 2: The Approval Gate</p>
                                <p>Once submitted, your application enters the <strong>Schologic Review Gate</strong>. Our enterprise team manually verifies your institutional credentials. This process typically takes less than 2 hours during business days. During this time, your dashboard will display: <em>"Application Received. Awaiting Schologic Review."</em></p>

                                <p className="font-bold mt-8">Step 3: Magic Link Activation</p>
                                <p>Upon approval, you will receive an activation email containing a secure <strong>Magic Link</strong>. We use passwordless authentication for the Pilot Portal to reduce login friction for senior management and faculty. Clicking the link instantly authenticates your device and grants you access to the <strong>Committee Workspace</strong> to begin designing your pilot.</p>
                            </div>
                        </section>

                        {/* 3. Team Formation & Collaboration Workspace */}
                        <section id="team-collaboration">
                            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-8 pt-8 border-t border-slate-100">3. Team Formation & Collaboration Workspace</h2>
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-slate-900">Why Invite a Committee?</h3>
                                <p>
                                    Adopting an operating system for academic integrity is an institutional decision that directly impacts how faculty teach. A successful pilot requires deep buy-in from the academic staff who will use the platform daily.
                                </p>
                                <p>
                                    The Pilot Management Portal is designed to bring your key academic stakeholders into a single digital room. For example:
                                </p>
                                <ul className="list-disc pl-5 space-y-4">
                                    <li><strong>The Head of Department (HOD)</strong> needs to evaluate curriculum alignment and competency tracking.</li>
                                    <li><strong>The <Link href="/use-cases/instructors" className="text-indigo-600 hover:underline">Lead Instructors</Link></strong> need to test the <Link href="/features/ai-teaching-assistant" className="text-indigo-600 hover:underline">AI Teaching Assistant</Link>, automated rubrics, and the RoBERTa detection models with actual student submissions.</li>
                                    <li><strong>The IT Director</strong> needs access to API documentation, IMSCC import guidelines, and ISO 27001 data sovereignty certificates.</li>
                                </ul>

                                <h3 className="text-xl font-bold text-slate-900 mt-12">How to Invite Members</h3>
                                <p>As the Institutional Champion, you can invite up to <strong>five (5) key stakeholders</strong> to join your private pilot workspace.</p>
                                <ol className="list-decimal pl-5 space-y-2">
                                    <li>Navigate to the <strong>Team Setup</strong> tab in your pilot dashboard.</li>
                                    <li>Enter the colleague's Name, Role, and Institutional Email.</li>
                                    <li>Assign their <strong>Access Permission</strong>.</li>
                                    <li>Click <strong>Send Invite</strong>. They will receive a secure magic link to join your workspace immediately.</li>
                                </ol>

                                <h3 className="text-xl font-bold text-slate-900 mt-12">Understanding Roles & Permissions</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm border-collapse border border-slate-200">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-900 uppercase tracking-wider">
                                                <th className="py-4 px-4 font-black">Role</th>
                                                <th className="py-4 px-4 font-black">Capabilities</th>
                                                <th className="py-4 px-4 font-black">Ideal For</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-600">
                                            <tr>
                                                <td className="py-4 px-4 text-slate-900 font-bold whitespace-nowrap">Primary Champion</td>
                                                <td className="py-4 px-4 leading-relaxed">Full control. Can submit the final pilot request, delete the workspace, and override all settings.</td>
                                                <td className="py-4 px-4">Dean of Academics, Head of E-Learning</td>
                                            </tr>
                                            <tr>
                                                <td className="py-4 px-4 text-slate-900 font-bold whitespace-nowrap">Read/Write</td>
                                                <td className="py-4 px-4 leading-relaxed">Can edit module configurations, post in the discussion board, upload sample materials, and complete assigned tasks.</td>
                                                <td className="py-4 px-4 whitespace-nowrap">Heads of Departments (HODs), Lead Instructors</td>
                                            </tr>
                                            <tr>
                                                <td className="py-4 px-4 text-slate-900 font-bold whitespace-nowrap">Read-Only</td>
                                                <td className="py-4 px-4 leading-relaxed">Can view configurations, read discussions, and download the final Proposal & ROI Blueprint. Cannot edit.</td>
                                                <td className="py-4 px-4 whitespace-nowrap">IT Administrators, Quality Assurance Officers</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mt-12">Collaboration Tools</h3>
                                <p>To eliminate the need for lengthy physical meetings, the Pilot Portal is equipped with powerful built-in collaboration tools tailored for academic teams.</p>

                                <p className="font-bold mt-8">1. Automated Task Assignment & Scheduling</p>
                                <p>Deploying an LMS involves multiple moving parts. To keep the pilot on track, the portal automatically generates a <strong>Deployment Task List</strong> based on the modules you select.</p>
                                <ul className="list-disc pl-5 space-y-4">
                                    <li><strong>How it Works:</strong> If you select the <em>OER Library</em>, the system automatically generates a task: <em>"Upload sample IMSCC common cartridge textbooks."</em></li>
                                    <li><strong>Delegation:</strong> The Champion can assign this specific task to an invited <strong>Lead Instructor</strong>, setting a target deadline.</li>
                                    <li><strong>Academic Tasks:</strong> If you select the <em>Practicum Manager</em>, a task is generated: <em>"Upload sample CDACC logbook rubrics."</em> This can be assigned directly to the <strong>HOD</strong>.</li>
                                    <li><strong>Progress Tracking:</strong> The dashboard displays a global progress bar (e.g., <em>65% Ready for Pilot Launch</em>), ensuring all departments and instructors complete their prerequisites before the deployment kickoff.</li>
                                </ul>

                                <p className="font-bold mt-8">2. The Pilot Discussion Board</p>
                                <p>Say goodbye to lost email threads. The portal features a secure, threaded messaging center connecting your 5-person committee directly with the Schologic deployment team.</p>
                                <ul className="list-disc pl-5 space-y-4">
                                    <li><strong>Centralized Context:</strong> All questions regarding course migration strategies (IMSCC), rubric configurations, or AI scoring methodologies happen in one place.</li>
                                    <li><strong>AI-Assisted Support:</strong> Our Schologic AI Assistant monitors the board and can provide instant answers to documentation queries, while our human team reviews complex pedagogical strategies.</li>
                                    <li><strong>Visibility:</strong> All team members (including Read-Only) can view the discussion history, ensuring the HODs, Lead Instructors, and Administrators are always on the same page regarding project progress.</li>
                                </ul>
                            </div>
                        </section>

                        {/* 4. Customizing Your LMS Needs */}
                        <section id="pilot-architect">
                            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-8 pt-8 border-t border-slate-100 italic">4. Customizing Your LMS Needs: The Pilot Architect for Institutional Success</h2>
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-slate-900">Selecting Your Modules</h3>
                                <p>Schologic LMS is highly modular. During the pilot design phase, your committee will select the specific tools that align with your institution's immediate pedagogical goals. The platform is divided into <strong>Core Modules</strong> and <strong>AI & Resource Add-ons</strong>.</p>

                                <p className="font-bold mt-8">1. Core Modules (Choose One or Both)</p>
                                <ul className="list-disc pl-5 space-y-4">
                                    <li><strong><Link href="/features/class-manager" className="text-indigo-600 hover:underline">Class Manager</Link>:</strong> The foundational learning management environment. Includes course creation, assignment submissions, quiz generation, and the native grades table. <em>(Ideal for standard academic faculties).</em></li>
                                    <li><strong><Link href="/features/practicum-manager" className="text-indigo-600 hover:underline">Practicum Manager</Link>:</strong> A complete digital solution for industrial attachments and teaching practice. Includes daily/weekly <strong>digital logbooks</strong>, geofencing for physical presence verification, supervisor evaluation links, and CDACC-aligned competency tracking. <em>(Essential for TVETs and applied sciences).</em></li>
                                </ul>

                                <p className="font-bold mt-8">2. Powerful Add-ons</p>
                                <p>Depending on your institution's challenges, you can toggle these advanced features for your pilot:</p>
                                <ul className="list-disc pl-5 space-y-4">
                                    <li><strong><Link href="/features/ai-detection" className="text-indigo-600 hover:underline">AI Detection & Forensics</Link>:</strong> Equip instructors with granular, sentence-level AI probability scoring using our RoBERTa models. Perfect for maintaining academic integrity in essay-heavy courses.</li>
                                    <li><strong><Link href="/features/ai-teaching-assistant" className="text-indigo-600 hover:underline">AI Teaching Assistant</Link>:</strong> Drastically reduce faculty workload. This module auto-generates grading rubrics based on assignment descriptions and provides deterministic, instant grading suggestions (strengths, weaknesses, and scores).</li>
                                    <li><strong><Link href="/features/oer-library" className="text-indigo-600 hover:underline">OER & Universal Reader</Link>:</strong> Import Common Cartridge (IMSCC) files from LibreTexts or OpenStax. Allow students to read, search, and AI-summarize high-quality textbooks directly inside the LMS—completely free of charge.</li>
                                </ul>

                                <h3 className="text-xl font-bold text-slate-900 mt-12">Defining Scale & Scope</h3>
                                <p>To ensure a highly focused and measurable pilot, we strongly recommend establishing clear boundaries for the test environment.</p>

                                <p className="font-bold mt-8">Recommended Scale</p>
                                <p>A pilot should be large enough to gather meaningful data, but small enough to manage effectively.</p>
                                <ul className="list-disc pl-5 space-y-4">
                                    <li><strong>Student Cap:</strong> We recommend limiting the pilot to a <strong>maximum of 200 students</strong> or <strong>10% of your total student population</strong> (whichever is lower).</li>
                                    <li><strong>Faculty Cap:</strong> Select 2 to 5 "Champion Instructors" or Lead HODs to run the pilot courses.</li>
                                </ul>

                                <p className="font-bold mt-8">Recommended Pilot Periods</p>
                                <ul className="list-disc pl-5 space-y-6">
                                    <li>
                                        <p className="font-bold">Phase 1: Standard Trial (2 to 4 Weeks)</p>
                                        <ul className="list-disc pl-5 space-y-2 mt-2">
                                            <li><em>Scope:</em> This phase utilizes the existing, out-of-the-box instructor and student features. It includes your custom branding and admin dashboard but requires no complex external API integrations.</li>
                                            <li><em>Goal:</em> Within the first 30 days, your committee will have enough hands-on experience and data to determine if Schologic is the right long-term match for your institution.</li>
                                        </ul>
                                    </li>
                                    <li>
                                        <p className="font-bold">Phase 2: Extended Evaluation & Improvement (Up to 4 Months)</p>
                                        <ul className="list-disc pl-5 space-y-2 mt-2">
                                            <li><em>Scope:</em> For institutions that pass the 30-day mark and wish to proceed, this phase allows for deeper customization. It involves full integration into your institution’s existing systems (e.g., Student Information Systems/ERP), development of bespoke features requested by your HODs, and extended academic testing across a full semester.</li>
                                        </ul>
                                    </li>
                                </ul>

                                <h3 className="text-xl font-bold text-slate-900 mt-12">Pricing & Investment</h3>
                                <p>The standard 2-4 week pilot is designed to be highly accessible. Any pricing associated with the setup, white-labeling, or cloud infrastructure depends entirely on the size of the pilot and the specific add-ons requested.</p>
                                <p><strong>The Enterprise Guarantee:</strong> If your institution chooses to convert the pilot into a full multi-year enterprise contract, <strong>100% of the pilot costs will be credited back</strong> toward your official contract.</p>

                                <h3 className="text-xl font-bold text-slate-900 mt-12">Setting Success KPIs</h3>
                                <p>A pilot is only successful if it proves ROI (Return on Investment). During the Architect phase, you will select the exact Key Performance Indicators (KPIs) you want us to track. You can define custom expectations, or choose from our standard metrics:</p>
                                <ul className="list-disc pl-5 space-y-4">
                                    <li><strong>⏱️ Grading Hours Saved:</strong> Track the reduction in manual grading time using the AI Teaching Assistant.</li>
                                    <li><strong>💰 Textbook Cost Savings:</strong> Calculate the exact monetary savings for your 200 pilot students by utilizing the OER Library instead of paid publishers.</li>
                                    <li><strong>📉 AI-Generated Submissions:</strong> Track the percentage of flagged AI essays to measure the improvement in academic integrity.</li>
                                    <li><strong>📊 Practicum Budget & Time Savings:</strong> Measure the reduction in administrative overhead by digitizing attachment logbooks and automated supervisor grading.</li>
                                    <li><strong>🎓 Student Involvement:</strong> Track daily active users, resource open rates, and digital logbook compliance.</li>
                                </ul>
                            </div>
                        </section>

                        {/* 5. Dashboard Setup & Branding Configuration */}
                        <section id="branding-config">
                            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-8 pt-8 border-t border-slate-100">5. Dashboard Setup & Branding Configuration</h2>
                            <div className="space-y-6">
                                <p>A key advantage of Schologic is that it does not feel like third-party software; it becomes an integrated part of your institution’s digital identity. In this step, your committee will define the look, feel, and governance of your pilot tenant.</p>

                                <h3 className="text-xl font-bold text-slate-900 mt-8">Domain & URL Setup</h3>
                                <p>You have two options for how your faculty and students will access the platform during the pilot:</p>
                                <ol className="list-decimal pl-5 space-y-4">
                                    <li><strong>Schologic Subdomain (Standard):</strong> Fast and secure. Your portal will be hosted at <code>yourinstitution.schologic.com</code>.</li>
                                    <li><strong>Custom Subdomain (Enterprise):</strong> For a fully white-labeled experience, you can point your own domain (e.g., <code>lms.yourinstitution.ac.ke</code>) to our servers. <em>(Note: Refer to our pricing page for custom domain SSL provisioning details).</em></li>
                                </ol>

                                <h3 className="text-xl font-bold text-slate-900 mt-8">White-labeling & UI Design</h3>
                                <p>Your portal should reflect your institution's pride and heritage. Through the configurator, you will upload and set:</p>
                                <ul className="list-disc pl-5 space-y-4">
                                    <li><strong>Institution Logos:</strong> Upload your primary crest/logo for the dashboard header, and a simplified favicon for the browser tab.</li>
                                    <li><strong>Theme & Colors:</strong> Select your institution's primary and secondary brand colors. These will automatically map to buttons, links, and active states across the LMS.</li>
                                    <li><strong>Login Page Design:</strong> Customize the background image or welcome message students see when they log in to submit their assignments.</li>
                                </ul>

                                <h3 className="text-xl font-bold text-slate-900 mt-8">Admin Dashboard Views</h3>
                                <p>As the Institutional Champion or HOD, your view of the platform is different from a standard instructor. You can configure your Admin Dashboard layout to prioritize what matters most to you:</p>
                                <ul className="list-disc pl-5 space-y-4">
                                    <li><strong>The Academic View:</strong> A simplified layout focusing on student engagement, recent assignment submissions, course health, and faculty activity.</li>
                                    <li><strong>The Analytics View:</strong> A data-heavy layout prioritizing real-time KPI tracking. View live graphs of aggregate AI detection scores across all departments, total grading hours saved this week, and system storage usage.</li>
                                </ul>

                                <h3 className="text-xl font-bold text-slate-900 mt-8">Governance & Instructor Permissions</h3>
                                <p>Schologic provides granular control over what your teaching staff can and cannot do. During setup, you will define the "Control Level" granted to your Instructors:</p>

                                <p className="font-bold mt-8 underline">Class & Content Management:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><em>Can instructors independently create new classes, or are classes centrally provisioned by the Admin?</em></li>
                                    <li><em>Can instructors upload their own proprietary files (PDFs, DOCX) to the Resource Library, or must they rely only on Admin-approved IMSCC OER cartridges?</em></li>
                                </ul>

                                <p className="font-bold mt-8 underline">AI & Assessment Settings:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><em>Can instructors customize AI detection thresholds (e.g., choosing between RoBERTa Large or OpenAI models) for their specific classes, or is a strict global default enforced by the institution?</em></li>
                                    <li><em>Can instructors manually override AI-generated rubric scores?</em></li>
                                </ul>

                                <p className="font-bold mt-8 underline">Student Management:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><em>Can instructors manually add, remove, or suspend students from their specific classes, or is roster management strictly handled by the Registrar/IT?</em></li>
                                </ul>

                                <p className="font-bold mt-8 underline">Communications:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><em>Configure global messaging and notification settings. Determine if students can message instructors directly through the platform, and define which actions trigger automated email alerts (e.g., "Assignment Graded" or "Logbook Rejected").</em></li>
                                </ul>

                                <p className="mt-8 text-sm text-slate-500 italic font-medium">By defining these permissions upfront, HODs and IT Directors can ensure the platform operates securely and strictly within institutional policy.</p>
                            </div>
                        </section>

                        {/* 6. Finalizing the Request & The Evaluation Phase */}
                        <section id="evaluation-phase">
                            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-8 pt-8 border-t border-slate-100">6. Finalizing the Request & The Evaluation Phase</h2>
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-slate-900">Reviewing Your Custom Blueprint</h3>
                                <p>Before you formally request your pilot, the Pilot Management Portal (PMP) automatically generates a comprehensive <strong>Pilot Blueprint</strong>. This is a consolidated summary of every decision your committee has made during the setup phase.</p>
                                <p>As the Institutional Champion, you should thoroughly review this blueprint. It outlines:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>The chosen modules (e.g., Practicum Manager, AI Teaching Assistant).</li>
                                    <li>The exact scope and scale (e.g., maximum of 200 students, 4 Lead Instructors).</li>
                                    <li>The targeted KPIs (e.g., grading hours saved, textbook cost reductions).</li>
                                    <li>Your white-labeling and dashboard governance settings.</li>
                                </ul>
                                <p>This blueprint serves as the foundational agreement for what Schologic will build and deliver for your institution.</p>

                                <h3 className="text-xl font-bold text-slate-900 mt-8">Formal Submission & Schologic Review</h3>
                                <p>Once your committee is satisfied with the blueprint, the Champion will click <strong>Submit Formal Pilot Request</strong>.</p>
                                <p>At this stage, your customized application is sent directly to the Schologic Enterprise Engineering team. Within 24 to 48 hours, our team will review the technical feasibility of your submission. We will then update your portal with a formal acknowledgment, advising you on the exact deployment timeline and any specific prerequisites required from your IT department or HODs.</p>

                                <h3 className="text-xl font-bold text-slate-900 mt-8">Development & Customization Timeline (1-2 Weeks)</h3>
                                <p>Schologic does not offer generic, off-the-shelf sandbox accounts. We build a dedicated, secure tenant specifically for your institution.</p>
                                <ul className="list-disc pl-5 space-y-4">
                                    <li><strong>Timeline:</strong> The standard development, customization, and cloud provisioning process takes between 1 to 2 weeks.</li>
                                    <li><strong>Tracking Progress:</strong> You do not need to wait in the dark. Your committee can log into the Pilot Management Portal at any time to view a live progress tracker.</li>
                                    <li><strong>Feedback Loop:</strong> As our engineers configure your specific grading rubrics or import your OER IMSCC cartridges, they will push updates to the portal. Your team can review these configurations and provide immediate feedback directly through the PMP interface, ensuring the final environment perfectly matches your academic requirements.</li>
import { getPilotUrl } from '@/lib/urls';
                                </ul>

                                <h3 className="text-xl font-bold text-slate-900 mt-8">Go-Live: The Admin Dashboard & Evaluation Module</h3>
                                <p>Once the 1-2 week development phase is complete, your pilot environment goes live.</p>
                                <p>At this point, the Institutional Champion and designated HODs are granted access to the <strong>live Admin Dashboard</strong>. Your selected instructors and students can now log in, join classes, and begin utilizing the platform for the agreed 2-to-4 week trial period.</p>
                                <p>Simultaneously, the portal unlocks the <strong>Evaluation Module</strong>. This is where the true value of the pilot is measured.</p>

                                <h3 className="text-xl font-bold text-slate-900 mt-8">Detailed Evaluation & Transition Process</h3>
                                <p>A pilot is only as good as the data it produces. The Evaluation Module is a specialized dashboard within the PMP designed to track the exact KPIs you established in Step 4.</p>

                                <p className="font-bold mt-8 underline">1. Continuous KPI Monitoring</p>
                                <p>Throughout the 2-4 week pilot, the Evaluation Module continuously aggregates data from your live tenant. You will see real-time, quantifiable metrics such as:</p>
                                <ul className="list-disc pl-5 space-y-3 mt-4">
                                    <li><em>Time Saved:</em> The exact number of hours the AI Teaching Assistant saved your Lead Instructors during the grading process.</li>
                                    <li><em>Financial Impact:</em> The total cost saved by students accessing free LibreTexts/OpenStax materials via the Universal Reader.</li>
                                    <li><em>Academic Integrity:</em> The ratio of authentic human submissions versus AI-flagged content, demonstrating the effectiveness of the RoBERTa forensics models.</li>
                                    <li><em>Operational Efficiency:</em> For TVETs, the percentage of practicum logbooks successfully digitized and evaluated by workplace supervisors without physical paperwork.</li>
                                </ul>

                                <p className="font-bold mt-8 underline">2. The 30-Day Milestone Review</p>
                                <p>At the end of the standard trial period (typically 30 days), Schologic generates an automated <strong>Executive Pilot Report</strong>. This report compares your initial expectations against the actual platform data. Your committee can use this definitive document to present a factual, data-driven business case to the Vice Chancellor or institutional board.</p>

                                <p className="font-bold mt-8 underline">3. Transitioning to an Enterprise License</p>
                                <p>If your institution decides that Schologic is the right long-term partner, the transition from Pilot to Enterprise is seamless.</p>
                                <ul className="list-disc pl-5 space-y-4">
                                    <li><strong>Zero Data Loss:</strong> All instructor accounts, student submissions, custom rubrics, and configured classes from the pilot are securely preserved. There is no need to "start over."</li>
                                    <li><strong>Unlocking Phase 2 (Extended Customization):</strong> Upon signing an enterprise agreement, you enter the extended evaluation and improvement phase (up to 4 months). This unlocks deep integrations (such as tying Schologic into your existing Student Information System) and rolling the platform out to the wider student population.</li>
                                    <li><strong>Financial Credit:</strong> As outlined in the Pilot Architect phase, 100% of the investment made during the pilot setup will be directly credited toward your official contract.</li>
                                </ul>
                            </div>
                        </section>
                    </div>

                    {/* Final CTA Footer */}
                    <div className="mt-32 pt-16 border-t border-slate-100 text-center">
                        <Link
                            href={getPilotUrl()}
                            className="inline-flex items-center gap-2 px-10 py-5 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl active:scale-95 group"
                        >
                            Complete Pilot Scoping
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform rotate-180" />
                        </Link>
                    </div>
                </article>
            </main>

            {/* Simple Footer */}
            <footer className="py-12 border-t border-slate-100 bg-slate-50">
                <div className="max-w-4xl mx-auto px-6 text-center text-slate-500 text-sm font-light">
                    &copy; {new Date().getFullYear()} Schologic LMS. All rights reserved. | Official Knowledge Base
                </div>
            </footer>
        </div>
    );
}
