# Schologic LMS - Platform Overview

## What is Schologic LMS?

Schologic LMS is an AI-powered Learning Management System designed specifically for academic integrity verification and modern teaching workflows. It helps instructors detect AI-generated content in student submissions while providing intelligent tools for grading, resource management, and course delivery.

---

## Core Value Propositions

### 1. AI Detection in Student Work

Automatically analyze student submissions to detect AI-generated content with unprecedented granularity.

**Key Features:**
- Paragraph-level and sentence-level AI probability scoring
- Multiple detection models to choose from
- Three scoring methods for different use cases
- Real-time analysis on submission
- Detailed segment breakdown with highlighting

**How It Benefits You:**
- Maintain academic integrity standards
- Identify patterns in AI-assisted work
- Make informed grading decisions
- Save time on manual review

---

### 2. AI Teaching Assistant

Get AI-powered assistance for rubric generation and grading feedback with deterministic, consistent scoring.

**Key Features:**
- Auto-generate rubrics from assignment descriptions
- AI-powered submission analysis with strengths/weaknesses
- Rubric-based grading with calculated scores
- Consistent multiplier-based scoring system

**How It Benefits You:**
- Create fair, comprehensive rubrics quickly
- Get objective grading suggestions
- Reduce grading time significantly
- Ensure consistent evaluation across submissions

---

### 3. AI-Powered Document Reader

Universal reader for PDFs, DOCX files, and course cartridges with built-in AI summarization.

**Key Features:**
- Support for PDF, DOCX, and IMSCC formats
- Zoom, search, and full-screen viewing
- Table of contents navigation for cartridges
- AI-powered document summarization

**How It Benefits You:**
- View all course materials in one place
- Quick AI summaries for long documents
- Professional reading experience for students
- No external software needed

---

### 4. Free Open Educational Resources

Access thousands of free textbooks from LibreTexts, OpenStax, and other OER sources via Common Cartridge (IMSCC) format.

**Key Features:**
- Import IMSCC course packages
- Browse structured content with TOC navigation
- Link resources directly to classes
- Students access in Universal Reader

**How It Benefits You:**
- Reduce textbook costs for students
- Access peer-reviewed academic content
- Organize resources within your LMS
- Seamless integration with courses

---

### 5. Instant Help Chatbot

Get answers to your questions 24/7 with the AI-powered help assistant.

**Key Features:**
- Natural language queries about any platform feature
- Context-aware responses based on this knowledge base
- Step-by-step guidance for common tasks
- Instant access from anywhere in the platform

**How It Benefits You:**
- No waiting for support tickets
- Learn features at your own pace
- Get help during off-hours or weekends
- Reduce onboarding time for new instructors

---

## Key Terminology

| Term | Definition |
|------|------------|
| **AI Score** | Percentage (0-100%) indicating likelihood content was AI-generated |
| **Authenticity Score** | 100% minus AI Score = human-written likelihood |
| **Segment** | Unit of analyzed text (paragraph or sentence based on granularity) |
| **Flagged Content** | Segments exceeding the AI detection threshold |
| **Rubric** | Grading criteria with point allocations and performance levels |
| **Asset** | Any resource in your library (document, file, URL, or cartridge) |
| **Common Cartridge (IMSCC)** | Standard format for packaging and sharing educational content |
| **LibreTexts** | Free, peer-reviewed textbook platform compatible with Schologic |
| **Granularity** | Analysis unit size: Paragraph or Sentence |
| **Scoring Method** | How AI detection scores are calculated: Weighted, Strict, or Binary |

---

## Platform Architecture

Schologic LMS is built as a modern web application with:

- **Frontend**: Next.js React application
- **Backend**: Serverless API routes
- **Database**: Supabase (PostgreSQL)
- **AI Services**: Hugging Face models for detection, PublicAI for grading
- **Storage**: Vercel Blob for file storage

---

## User Roles

| Role | Capabilities |
|------|--------------|
| **Instructor** | Create classes, assignments, manage students, grade submissions, access library |
| **Student** | Join classes, submit assignments, take quizzes, view grades and AI feedback |

---

## Getting Help

### Instant Help Chatbot

Need assistance? The **Schologic Help Assistant** is available 24/7:

1. Look for the **chat bubble** icon in the bottom corner
2. Type your question in natural language
3. Get instant, context-aware answers

**Example Questions:**
- "How do I create a new class?"
- "What does the AI score mean?"
- "How do I upload a textbook from LibreTexts?"

The chatbot uses this knowledge base to provide accurate, up-to-date information about all Schologic features.

---

## Next Steps

- [Getting Started](./02-getting-started.md) - First login and profile setup
- [Managing Classes](./03-managing-classes.md) - Create and configure courses
- [AI Detection](./04-ai-detection.md) - Understand AI scoring system
