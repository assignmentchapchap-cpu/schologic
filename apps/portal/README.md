# Schologic LMS 🎓
**AI-Powered Learning Management System** (formerly ScholarSync) for Modern Educators.
 (MVP)

Schologic LMS is a web application designed to help instructors and students verify academic integrity using AI detection. It provides a simple classroom management system where instructors can create classes, generates invite codes for students, and analyzes submissions for AI-generated content using the Hugging Face Inference API.

## Features

*   **Unified Auth**: Support for Guest access (Anonymous Auth) and clear role separation.
*   **Instructor Portal**:
    *   Create Classrooms & Generate Invite Codes.
    *   View real-time submissions from students.
    *   Detailed "Sentence-Level" AI analysis reports.
    *   Lock/Unlock functionality for classes.
*   **Student Portal**:
    *   Join classes using a 6-digit code.
    *   Submit assignments via Text Paste or `.docx` Upload.
    *   Instant feedback on AI probability score.
*   **AI Engine**: Powered by `Hello-SimpleAI/chatgpt-detector-roberta` via Hugging Face.

## Tech Stack

*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS, Lucide React
*   **Backend**: Supabase (PostgreSQL, Auth, Realtime)
*   **AI**: Hugging Face Inference API
*   **File Processing**: mammoth.js (Docx parsing)

## Getting Started

### Prerequisites

*   Node.js 18+
*   A Supabase Project
*   A Hugging Face Account (Access Token)

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
HUGGING_FACE_ACCESS_TOKEN=your_hf_token
```

### 2. Database Setup

Run the SQL found in [`supabase/schema.sql`](./supabase/schema.sql) in your Supabase Project's SQL Editor. This will:
*   Create `institutions`, `profiles`, `classes`, and `submissions` tables.
*   Enable Row Level Security (RLS) policies.

**Important**: Go to Supabase Dashboard -> Authentication -> Providers and enable **Anonymous Sign-ins**.

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

*   `src/app/(auth)`: Authentication pages.
*   `src/app/instructor`: Dashboard and Class management pages.
*   `src/app/student`: Submission and Result pages.
*   `src/lib/ai-service.ts`: Logic for text splitting and Hugging Face API integration.
*   `src/lib/supabase.ts`: Supabase client initialization.

## Known Issues (MVP)

*   **Rate Limits**: The free Hugging Face Inference API has rate limits. If analysis fails, check console logs.
*   **File Upload**: Currently supports `.docx` only.
*   **Auth**: "Guest" accounts are temporary unless upgraded (upgrade flow not fully implemented in MVP).
