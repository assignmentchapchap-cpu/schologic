# Practicum Management

## Overview

The Practicum Management system provides a complete digital solution for managing industrial attachments, teaching practice, and field placements. From setup to final grading, the system streamlines the entire practicum lifecycle for instructors, students, and workplace supervisors.

---

## Table of Contents

1. [Instructor Setup](#instructor-setup)
2. [Student Journey](#student-journey)
3. [Supervisor Workflow](#supervisor-workflow)
4. [Grading System](#grading-system)
5. [Frequently Asked Questions](#frequently-asked-questions)

---

## Instructor Setup

### Creating a New Practicum

Navigate to **Practicum** → **Create New Practicum** to set up a new practicum session.

### Setup Options

#### 1. Basic Information

- **Title**: Name of the practicum (e.g., "Teaching Practice 2024 - Semester 1")
- **Cohort Code**: Unique identifier for administrative tracking
- **Invite Code**: Code students use to join the practicum
- **Duration**: Start and end dates for the entire practicum period

#### 2. Configuration Options

**Log Interval:**
- **Daily**: Students submit logs every day
- **Weekly**: Students submit consolidated weekly reports

**Geolocation:**
- Enable to require students to clock in/out from their placement location
- Verifies students are physically present at workplace

**Final Report:**
- Toggle whether students must submit a final practicum report
- Required for most practicum types

#### 3. Templates

Choose from built-in templates or create custom ones:

**Teaching Practice Template:**
- Subject Taught
- Grade/Class Level
- Topic Covered
- Teaching Methods Used
- Lesson Objectives
- Student Engagement Notes
- Challenges Faced
- Supervisor Feedback

**Industrial Attachment Template:**
- Department/Section
- Tasks Performed
- Skills Acquired
- Tools/Equipment Used
- Challenges Encountered
- Mentor Feedback
- Daily Hours

**Custom Template:**
- Define your own fields using JSON structure
- Fully customizable for specialized placements

#### 4. Rubrics

Configure grading criteria for each assessment component:

**Logs Rubric:**
- Define evaluation criteria for daily/weekly logs
- Can include: Consistency, Detail Level, Reflection Quality, Professional Language
- Assign weights to each criterion

**Student Report Rubric:**
- Sections: Introduction, Methodology, Findings, Reflection, Conclusion
- Each section has customizable criteria and point allocation
- Total points typically 100

**Supervisor Report Rubric:**
- Work Quality
- Professional Conduct
- Technical Skills
- Communication
- Initiative & Creativity
- Reliability
- Overall Performance

> **Note:** All rubrics are fully editable and can be customized to match your institution's standards.

#### 5. Timeline & Milestones

Set important dates:
- Log submission deadlines
- Supervisor evaluation period
- Final report due date
- Grade publication date

#### 6. Grading Configuration

**Component Weights:**
- Logs Grade: 0-100% (e.g., 30%)
- Student Report Grade: 0-100% (e.g., 30%)
- Supervisor Grade: 0-100% (e.g., 40%)

The system automatically calculates the final grade based on these weights.

**Manual Override:**
- Instructors can manually adjust any component grade
- Can override the calculated final grade if needed

---

## Student Journey

### 1. Joining the Practicum

**Step 1: Get Invite Code**
- Receive invite code from instructor
- Access via email, LMS, or class announcement

**Step 2: Join Practicum**
- Navigate to **Dashboard** → **Join Practicum**
- Enter the invite code
- Click **Continue**

**Step 3: Complete Enrollment Form**

Fill out required information:
- **Academic Details**: Course code, program, year of study
- **Workplace Information**: Company/School name, address, department
- **Supervisor Details**: Name, title, phone number, email address
- **Schedule**: Working days and hours
- **Location**: Physical address (for geofencing if enabled)

**Step 4: Submit for Approval**
- Review all information
- Click **Submit for Approval**
- Wait for instructor verification

> **Approval Process:** Depending on instructor settings, enrollment may be:
> - **Auto-approved**: Immediate access
> - **Manual review**: Wait for instructor approval (usually 1-2 days)

**Step 5: Approval Notification**
- Receive email notification when approved
- Access practicum dashboard to begin logging

---

### 2. Creating Log Entries

**Daily Logs (If enabled):**

1. Click **+ New Log Entry**
2. Select the date
3. **Clock In/Out**: Enter arrival and departure times
4. **Fill Template Fields**: Based on your practicum type
5. **Save Options**:
   - **Save as Draft**: Continue editing later
   - **Submit for Review**: Send to instructor for verification

**Weekly Logs (If enabled):**

1. Click **+ New Weekly Log**
2. Select the week date range
3. Fill consolidated weekly summary
4. Include daily breakdowns if required
5. Submit for review

**Log Status Indicators:**
- 🟡 **Draft**: Saved locally, not submitted
- 🔵 **Pending**: Submitted, awaiting verification
- 🟢 **Verified**: Approved by instructor
- 🔴 **Rejected**: Returned for corrections (check feedback)

---

### 3. Supervisor Evaluation

At the designated time (usually near end of practicum):

**For Workplace Supervisors:**

1. Workplace supervisor receives **auto-generated email** with:
   - Student's name and details
   - Secure evaluation link (no login required)
   - Due date for submission

2. Supervisor clicks link and completes evaluation form:
   - Rates student on multiple criteria
   - Provides written feedback
   - Submits overall score

3. Submission is recorded and immediately available to instructor

**Security Features:**
- One-time secure token (cannot be reused)
- Link expires after submission or deadline
- No registration required for supervisor

---

### 4. Submitting Final Report

1. Navigate to **Final Report** tab in practicum dashboard
2. Click **Upload Report**
3. Select file (PDF or Word document)
4. **Optional**: Add submission notes
5. Click **Submit Report**

**Requirements:**
- File must be PDF (.pdf) or Word (.docx/.doc)
- Maximum file size: 10MB
- Can resubmit before grading deadline

**After Submission:**
- Status changes to "Report Submitted"
- Instructor receives notification
- Can view uploaded file to verify
- No further edits allowed after deadline

---

### 5. Viewing Grades

**Grades Tab:**
- View individual component grades:
  - 📗 Logs Grade
  - 📘 Student Report Grade  
  - 📙 Supervisor Grade
  - 📕 **Final Grade** (weighted average)

**Grade Breakdown:**
- Click on any grade to see detailed rubric scores
- View instructor comments and feedback
- Download graded report with annotations

---

## Supervisor Workflow

### Auto-Generated Supervisor Evaluation

**System Process:**

1. **Trigger**: Instructor initiates supervisor evaluation phase
2. **Email Generation**: System automatically sends emails to all workplace supervisors
3. **Email Contents**:
   - Student name and placement details
   - Personalized evaluation link
   - Deadline for submission
   - Instructions for completing the form

**Evaluation Form:**

Supervisors access a web form (no login) with:
- Student information (read-only)
- Rating criteria based on rubric
- Slider scales for quantitative ratings
- Text fields for qualitative feedback
- Overall score calculation
- Submit button

**Submission:**
- One-click submission
- Confirmation email sent to supervisor
- Instructor notified immediately
- Grade automatically populated in student record

**Benefits:**
- No need to create supervisor accounts
- Secure, one-time-use links
- Mobile-friendly forms
- Reduces administrative burden
- Immediate data capture

---

## Grading System

### Composite Grading

The system combines three grade components into a final grade:

#### Grade Components

**1. Logs Grade (📗)**
- Based on consistency, quality, and completeness of log entries
- Can be auto-calculated from rubric or manually assigned
- **Manual Input**: Instructor can override automated grade

**2. Student Report Grade (📘)**
- Based on uploaded final report evaluation
- Graded using customizable rubric
- **Manual Input**: Instructor assigns grade after review

**3. Supervisor Grade (📙)**
- Derived from supervisor evaluation form
- Can be auto-imported from supervisor submission
- **Manual Input**: Instructor can manually enter if needed

**4. Final Grade (📕)**
- Weighted average of three components
- **Formula**: `(Logs × Weight₁) + (Report × Weight₂) + (Supervisor × Weight₃)`
- **Manual Override**: Instructor can override calculated grade

---

### Grading Tabs

**Submissions Tab:**
Navigate through three filter views:

1. **Logs**: View and grade all log entries
   - Filter by student
   - Grade logs individually or in bulk
   - Emerald-themed grade input

2. **Student Reports**: Review uploaded final reports
   - Download and grade each report
   - Purple-themed grade input
   - View submission timestamps

3. **Supervisor Reports**: View supervisor evaluations
   - See supervisor feedback
   - Verify auto-populated grades
   - Blue-themed grade input

**Grades Tab:**

Comprehensive gradebook view:
- All students in table format
- Four grade columns (Logs, Report, Supervisor, Final)
- Color-coded status indicators
- Export to Excel/CSV
- Bulk grade updates
- Calculate final grades automatically

---

### Manual Grade Entry

**Individual Grading:**
1. Select student from list
2. Find grade input field (color-coded by component)
3. Enter numeric grade (0-100)
4. Press Enter or click outside field
5. Grade saves automatically

**Bulk Operations:**
- **Sync Supervisor Grades**: Auto-import from all submitted evaluations
- **Calculate Final Grades**: Batch calculate for all students
- **Export Grades**: Download complete gradebook

**Grade Persistence:**
- All grades save to database immediately
- Refetch after update to ensure sync
- Grades persist across sessions
- Edit anytime before final publication

---

## Frequently Asked Questions

### For Students

| Question | Answer |
| :--- | :--- |
| **Can I edit a log after submission?** | No, unless the instructor rejects it. Draft logs can be edited anytime. |
| **What if I missed a day?** | You can log past dates up until the weekly deadline or lock date. |
| **Who approves my logs?** | Your assigned instructor (University Supervisor). |
| **Can I resubmit my final report?** | Yes, before the deadline. After grading starts, resubmission requires instructor approval. |
| **When will I see my grades?** | After instructor completes grading and publishes grades. |
| **What if my supervisor doesn't receive the email?** | Contact your instructor to resend the evaluation link. |

### For Instructors

| Question | Answer |
| :--- | :--- |
| **Can I change templates after students start logging?** | Not recommended. Changes only affect new logs, not existing ones. |
| **How do I resend supervisor evaluation emails?** | Use the \"Resend Email\" button next to the student's name in the Supervisor Reports tab. |
| **Can I manually enter supervisor grades?** | Yes, click the blue grade input in Supervisor Reports column. |
| **What if I need to adjust rubric weights?** | Edit grading configuration. Recalculate final grades to apply new weights. |
| **Can students see supervisor feedback?** | Only if you enable \"Share supervisor feedback with students\" in settings. |
| **How do I export grades?** | Click **Export** button in Grades tab. Choose format (Excel/CSV). |

### For Supervisors

| Question | Answer |
| :--- | :--- |
| **Do I need to create an account?** | No, use the secure link sent via email. |
| **What if the link doesn't work?** | Contact the instructor who will resend a fresh link. |
| **Can I edit my submission?** | No, submissions are final. Contact instructor if correction needed. |
| **How long do I have to submit?** | Deadline is specified in the email. Links expire after deadline. |

---

## Best Practices

### For Instructors

✅ **Setup Phase:**
- Test your rubrics with sample grades before launch
- Clearly communicate deadlines to students
- Verify all supervisor email addresses are correct

✅ **During Practicum:**
- Review logs regularly (weekly recommended)
- Provide timely feedback on rejected logs
- Monitor student engagement through the dashboard

✅ **Grading Phase:**
- Grade components in order: Logs → Reports → Supervisor
- Use bulk operations for efficiency
- Verify final grade calculations before publishing

### For Students

✅ **Log Consistently:**
- Don't wait until the end to submit logs
- Be detailed and reflective in entries
- Save drafts if you need time to complete

✅ **Professional Communication:**
- Double-check supervisor contact information
- Inform supervisor they'll receive evaluation email
- Follow up if supervisor hasn't received email

✅ **Final Report:**
- Submit well before deadline
- Verify upload was successful
- Follow institutional formatting guidelines

---

## Next Steps

- [Managing Classes](./03-managing-classes.md)
- [Grading & Feedback](./07-grading-ta-assistant.md)
- [Analytics Dashboard](./12-analytics-insights.md)

---

## Technical Notes

**System Architecture:**
- Real-time sync between student and instructor views
- Automatic email notifications via Resend
- Secure, tokenized supervisor evaluation links
- Row-level security for data privacy
- Offline draft support (coming soon)

**Data Backup:**
- All submissions automatically backed up
- Logs stored with timestamps and version history
- Files stored in Vercel Blob with redundancy
