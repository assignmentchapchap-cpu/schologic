# Assignments & Quizzes

## Types of Assignments

| Type | Description | Grading |
|------|-------------|---------|
| **Standard Assignment** | Text/document submission with AI detection | Manual + AI assist |
| **Quiz** | Multiple-choice questions | Auto-graded |

---

## Creating a Standard Assignment

### Step-by-Step Process

1. **Navigate to Your Class**
   - Open the class from your dashboard
   - Click the **Assignments** tab

2. **Click Create Assignment**
   - Look for **+ Create Assignment** button
   - Assignment form opens

3. **Enter Basic Information**
   - **Title**: Name of the assignment (e.g., "Essay on Climate Change")
   - **Short Code**: Unique identifier (e.g., "ESSAY01")
   - **Description**: Detailed instructions for students

4. **Set Due Date**
   - Select date and time
   - Must be within class start/end dates
   - Students see countdown to deadline

5. **Configure Points**
   - **Max Points**: Total possible points (e.g., 100)
   - Used for grade calculations

6. **Optional Settings**
   - **Word Count**: Expected submission length
   - **Reference Style**: APA, MLA, Chicago, etc.

7. **Create the Assignment**
   - Click **Create** or **Save**
   - Assignment appears in list

---

## Creating a Quiz

### Step-by-Step Process

1. **Start Creating Assignment**
   - Follow steps 1-2 above

2. **Select Quiz Type**
   - Choose **Quiz** as the assignment type
   - Quiz builder interface appears

3. **Add Questions**
   For each question:
   
   a. **Enter Question Text**
      - Type your question clearly
   
   b. **Add Answer Choices**
      - Typically A, B, C, D options
      - Add as many as needed
   
   c. **Mark Correct Answer**
      - Click the correct option indicator
      - Only one correct answer per question
   
   d. **Set Point Value**
      - Points for this question
      - Contributes to total quiz score

4. **Add More Questions**
   - Click **Add Question**
   - Repeat for all questions

5. **Save Quiz**
   - Click **Save** or **Create**
   - Quiz is ready for students

### Quiz Features

- Auto-graded immediately on submission
- Students see results instantly
- No AI detection on quiz responses
- Question order can be randomized (if enabled)

---

## AI-Generated Rubrics

### What Is Auto-Rubric Generation?

When creating an assignment, you can let AI automatically generate a grading rubric based on your title and description.

### How to Enable

1. **During Assignment Creation**
   - Find **Auto-Generate Rubric** toggle
   - Switch to ON

2. **On Assignment Publish**
   - AI analyzes title and description
   - Generates 3-5 evaluation criteria
   - Creates point distribution

### How Rubrics Are Generated

The AI considers your assignment description and creates criteria with **importance levels** (1-5 scale):

| Level | Importance | Examples |
|-------|------------|----------|
| 5 | Extremely Important | Thesis statement, Evidence quality |
| 4 | Very Important | Argument structure, Analysis depth |
| 3 | Fairly Important | Writing style, Tone |
| 2 | Important | Grammar, Formatting |
| 1 | Slightly Important | Word count adherence |

### Point Distribution Formula

Points are distributed proportionally:

```
Criterion Points = (Criterion Importance / Sum of All Importances) × Max Points
```

**Example:**
- Max Points = 100
- Criteria: Thesis (5), Evidence (4), Structure (3), Grammar (2)
- Total Weight = 5 + 4 + 3 + 2 = 14
- Thesis Points = (5 / 14) × 100 = 36 points
- Evidence Points = (4 / 14) × 100 = 29 points
- Structure Points = (3 / 14) × 100 = 21 points
- Grammar Points = (2 / 14) × 100 = 14 points

### Editing Generated Rubrics

After generation, you can:
- Modify criterion names
- Adjust point allocations
- Add or remove criteria
- Change descriptions

---

## Performance Levels

Each rubric criterion has 5 performance levels with fixed multipliers:

| Level | Multiplier | Description |
|-------|------------|-------------|
| **Exceptional** | ×1.00 (100%) | Exceeds all requirements; comprehensive and nuanced |
| **Very Good** | ×0.80 (80%) | Strong performance; meets all major requirements |
| **Good** | ×0.60 (60%) | Satisfactory; acceptable with minor gaps |
| **Average** | ×0.40 (40%) | Basic; meets minimum standards but lacks depth |
| **Poor** | ×0.20 (20%) | Insufficient; fails to meet core requirements |

### Score Calculation

```
Criterion Score = Criterion Max Points × Level Multiplier
```

**Example:**
- Thesis criterion: 36 max points
- Student performs at "Very Good" level
- Score = 36 × 0.80 = 29 points

---

## Assignment Settings

### Available Options

| Setting | Description | Default |
|---------|-------------|---------|
| Due Date | Deadline for submissions | Required |
| Max Points | Total possible points | 100 |
| Word Count | Expected length | Optional |
| Reference Style | Citation format | None |
| AI Detection | Enable scoring | Class setting |
| Late Submissions | Allow after due date | Enabled |
| File Types | Allowed formats | TXT, DOCX |

### File Type Options

| Type | Extension | Features |
|------|-----------|----------|
| **Text** | .txt | Plain text, fastest processing |
| **Word Document** | .docx | Formatted text extraction |

---

## Managing Assignments

### Viewing Assignment Details

1. Click on assignment from list
2. See:
   - Assignment information
   - Submission count
   - Grading progress
   - AI score summary

### Viewing Submissions

1. Open assignment
2. Click **Submissions** or view list
3. Each submission shows:
   - Student name
   - Submission time
   - AI score
   - Grading status

### Editing Assignments

1. Open assignment
2. Click **Edit** or settings icon
3. Modify details
4. Save changes

**Note:** Some changes may not apply to existing submissions.

---

## Best Practices

### Writing Good Assignment Descriptions

For better AI-generated rubrics:
- Be specific about requirements
- List key components you expect
- State the purpose of the assignment
- Include any formatting requirements

### Setting Appropriate Due Dates

- Allow enough time for quality work
- Consider timezone differences
- Avoid conflicts with other major deadlines

### Quiz Question Tips

- Write clear, unambiguous questions
- Make wrong answers plausible
- Avoid "trick" questions
- Test a range of knowledge levels

---

## Next Steps

- [Grading & AI Assistant](./07-grading-ta-assistant.md) - Grade submissions
- [AI Detection](./04-ai-detection.md) - Understand AI scores
- [Managing Classes](./03-managing-classes.md) - Class configuration
