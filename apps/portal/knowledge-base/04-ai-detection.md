# AI Detection System

## How AI Detection Works

### The Detection Process

```
Step 1: Student Submits Text
        ↓
Step 2: Text Split into Segments
        (Paragraphs or Sentences based on Granularity setting)
        ↓
Step 3: Each Segment Analyzed
        (Sent to selected AI model via Hugging Face API)
        ↓
Step 4: Probability Scores Returned
        (0% to 100% for each segment)
        ↓
Step 5: Scoring Method Applied
        (Weighted, Strict, or Binary calculation)
        ↓
Step 6: Global AI Score Calculated
        (Aggregate score for entire submission)
        ↓
Step 7: Report Generated
        (Segment breakdown with highlighting)
```

---

## AI Detection Models

### Available Models

| Model | Display Name | Best For | Accuracy Notes |
|-------|--------------|----------|----------------|
| `Hello-SimpleAI/chatgpt-detector-roberta` | **RoBERTa Large (Baseline)** | General academic writing | Best balance of accuracy |
| `PirateXX/AI-Content-Detector` | **PirateXX Detector** | ChatGPT-style text | Optimized for ChatGPT outputs |
| `fakespot-ai/roberta-base-ai-text-detection-v1` | **OpenAI RoBERTa Base** | Alternative detection | Different training data |

### Model Selection Tips

1. **RoBERTa Large** - Use as your default. Works well for essays, research papers, and formal academic writing.

2. **PirateXX Detector** - Better for detecting ChatGPT-specific patterns. Good for informal assignments or creative writing.

3. **OpenAI RoBERTa Base** - Use when you want a second opinion or when other models show uncertain results.

### Testing Models
Use the [AI Lab](./05-ai-lab.md) to test how different models perform on sample text before applying to your classes.

---

## Scoring Methods Explained

### Overview

| Method | Threshold | Calculation | Use Case |
|--------|-----------|-------------|----------|
| **Weighted** | >50% probability | (flagged words × probability) / total words | **Recommended** - Nuanced scoring |
| **Strict** | >90% probability | Only high-confidence segments count | Conservative - Fewer false positives |
| **Binary** | >50% probability | Any flagged segment counts fully | Aggressive - Maximum detection |

### Weighted Method (Recommended)

**How It Works:**
- Each segment contributes proportionally to its AI probability
- A paragraph with 70% AI probability contributes 70% of its word count
- Produces nuanced scores between 0-100%

**Example:**
- 100-word paragraph with 70% AI probability
- Contribution = 100 × 0.70 = 70 words
- If total document is 500 words, this paragraph adds 14% to the global score

**When to Use:**
- General-purpose detection
- When you want granular scoring
- For essays and long-form content

---

### Strict Method

**How It Works:**
- Only segments with >90% AI probability are flagged
- Flagged segments count at full word count
- Non-flagged segments contribute nothing

**Example:**
- 100-word paragraph with 70% AI probability
- Not flagged (below 90% threshold)
- Contribution = 0 words

**When to Use:**
- When you want high confidence in flags
- To reduce false positives
- For academic integrity proceedings where certainty matters

---

### Binary Method

**How It Works:**
- Any segment with >50% AI probability is flagged
- Flagged segments count at full word count
- Simple on/off detection

**Example:**
- 100-word paragraph with 70% AI probability
- Flagged (above 50% threshold)
- Contribution = 100 words (full count)

**When to Use:**
- When you want maximum detection sensitivity
- For preliminary screening
- When any AI use is a concern

---

## Granularity Settings

### Paragraph Granularity (Default)

**How It Works:**
- Text is split at paragraph breaks
- Each paragraph analyzed as one unit
- Faster processing

**Best For:**
- Essays and research papers
- Long-form assignments
- General use

### Sentence Granularity

**How It Works:**
- Text is split at sentence boundaries (.!?)
- Each sentence analyzed individually
- More detailed but slower

**Best For:**
- Short responses
- Fill-in-the-blank questions
- When you need precise flagging

---

## Reading AI Reports

### Global AI Score vs. Authenticity Score

Schologic displays two complementary metrics:

| Metric | Calculation | Focus |
|--------|-------------|-------|
| **AI Score** | Direct model output (0-100%) | Detection of AI-generated content |
| **Authenticity Score** | 100% − AI Score | **Positive framing** of human authorship |

> 💡 **Tip**: When communicating with students, consider using "Authenticity Score" to focus on their original contribution rather than AI suspicion.

### Interpreting the AI Score

| Score Range | Meaning | Recommended Action |
|-------------|---------|-------------------|
| **0-30%** 🟢 | Likely human-written (70-100% Authenticity) | No action needed |
| **30-60%** 🟡 | Mixed/uncertain (40-70% Authenticity) | Review submission manually |
| **60-100%** 🔴 | High AI probability (<40% Authenticity) | Investigate further |

### Scoring Method Comparison Example

**Scenario**: A 500-word essay with 5 paragraphs. Two paragraphs (200 words total) have 75% AI probability; three paragraphs (300 words) have 20% AI probability.

| Method | Calculation | Final AI Score |
|--------|-------------|----------------|
| **Weighted** | (200×0.75 + 300×0.20) / 500 = 210/500 | **42%** |
| **Strict** | Only >90% counts → 0 flagged words | **0%** |
| **Binary** | 200 words flagged (>50%) / 500 total | **40%** |

> This example shows why **Weighted** is recommended—it captures nuance, while **Strict** may miss moderate AI use and **Binary** treats all flagged content equally.

### Segment Breakdown

Each segment shows:
- **Text Content**: The actual paragraph/sentence
- **AI Probability**: Percentage for that segment
- **Flagged Status**: Whether it counts toward the score
- **Contribution**: How much it adds to global score

### Color Coding

- 🟢 **Green segments**: Low AI probability
- 🟡 **Yellow segments**: Moderate AI signals
- 🔴 **Red segments**: High AI probability

---

## Important Limitations

### What AI Detection Can Do
✅ Indicate probability of AI-generated content
✅ Highlight suspicious segments
✅ Provide data for informed decisions
✅ Track patterns across submissions

### What AI Detection Cannot Do
❌ Prove definitively that content is AI-generated
❌ Detect all AI tools or paraphrased AI content
❌ Replace human judgment
❌ Account for legitimate AI assistance

### Best Practices

1. **Use as one input among many** - Don't rely solely on AI scores for academic decisions.

2. **Consider context** - Some disciplines may have higher "natural" AI-like patterns.

3. **Look at patterns** - Compare with student's previous work.

4. **Have a conversation** - Discuss concerning submissions with students.

5. **Set clear policies** - Define acceptable AI use in your syllabus.

---

## Technical Notes

### Automatic Exclusions

The following are automatically excluded from AI analysis:
- **Bibliography/References**: Lines starting with "References", "Bibliography", "Works Cited"
- **Citations**: Standard citation formats are filtered

### Minimum Text Requirements

- Text must be at least 50 characters for analysis
- Very short submissions may have unreliable scores
- Recommend minimum 100 words for accurate detection

---

## Related Documentation

### Prerequisites
- [Getting Started](./02-getting-started.md) - Profile setup and navigation

### Deep Dives
- [AI Lab](./05-ai-lab.md) - Test detection settings in sandbox
- [Assignments & Quizzes](./06-assignments-quizzes.md) - Configure assignment AI settings

### Student View
- [Student Workflows](./12-student-workflows.md) - How students see AI scores
- [Grading & AI Assistant](./07-grading-ta-assistant.md) - Grading with AI insights
