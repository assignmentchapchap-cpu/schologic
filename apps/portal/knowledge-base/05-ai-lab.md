# AI Lab (Testing Sandbox)

## What is the AI Lab?

The AI Lab is a sandbox environment where you can test AI detection settings before applying them to real classes. Use it to:

- Experiment with different AI models
- Compare scoring methods
- Test sample text patterns
- Calibrate your expectations

---

## Accessing the AI Lab

### Steps to Open

1. **Click Lab in Sidebar**
   - Find **Lab** in the main navigation menu
   - Click to open the AI Lab Studio

2. **View the Interface**
   - Left panel: Text input area
   - Right panel: Configuration and results

---

## Using the AI Lab

### Step-by-Step Analysis

1. **Enter Sample Text**
   - Paste or type text in the left panel
   - Minimum 50 characters required
   - Character count displays at bottom

2. **Configure Model Logic**
   - In the right panel, select scoring method:
   - **Binary**: Simple on/off detection
   - **Weighted**: Proportional scoring (recommended)
   - **Strict**: High-confidence only

3. **Set Granularity**
   - **Paragraph**: Analyze per paragraph
   - **Sentence**: Fine-grained analysis

4. **Select AI Model** (Settings Panel)
   - Click **Settings** button (gear icon)
   - Choose from available models
   - Save configuration

5. **Run Analysis**
   - Click **Run Analysis** button
   - Wait for processing (progress bar shows status)

6. **Review Results**
   - Global AI probability score
   - Risk indicator (High/Low)
   - Segment-by-segment breakdown

---

## Understanding Lab Results

### Score Display

The main score panel shows:
- **Large percentage**: Overall AI probability
- **Risk badge**: "High Risk" (>50%) or "Low Risk" (≤50%)
- **Chart**: Visual representation of segment scores

### Detailed Breakdown

Each analyzed segment shows:
- Original text content
- AI probability percentage
- "AI" badge (if flagged) or "Human" badge
- Contribution to overall score

---

## Testing Scenarios

### Scenario 1: Known AI Content
1. Copy text from ChatGPT or similar
2. Run analysis
3. Expect high AI scores (usually 60-90%)
4. Note which scoring method flags it

### Scenario 2: Known Human Content
1. Use text you personally wrote
2. Run analysis
3. Expect low AI scores (usually 0-30%)
4. Identify any false positives

### Scenario 3: Mixed Content
1. Combine human and AI-written paragraphs
2. Run analysis
3. See how segment breakdown identifies each
4. Compare Weighted vs Binary vs Strict results

### Scenario 4: Paraphrased AI Content
1. Take AI text and paraphrase it
2. Run analysis
3. Note how detection handles paraphrasing
4. Consider implications for your policies

---

## Comparing Settings

### Model Comparison

Test the same text with different models:

1. Run analysis with RoBERTa Large
2. Note the score
3. Open Settings, switch to PirateXX
4. Run again
5. Compare results

### Scoring Method Comparison

Without re-running the model:

1. Run analysis once
2. Switch between Binary/Weighted/Strict
3. Score recalculates instantly
4. See how each method affects the result

---

## Saving Your Configuration

### Steps to Save Settings

1. **Configure Your Preferences**
   - Select preferred model
   - Choose default scoring method
   - Set granularity

2. **Open Settings Panel**
   - Click the **Settings** button

3. **Save Configuration**
   - Click **Save Configuration** button
   - Settings saved to local storage
   - Confetti animation confirms save

### Persistence

- Settings persist in your browser
- Apply to future Lab sessions
- Do not affect class-level settings

---

## Lab vs Class Settings

| Aspect | AI Lab | Class Settings |
|--------|--------|----------------|
| Purpose | Testing and experimentation | Production analysis |
| Persistence | Browser local storage | Database |
| Affects Students | No | Yes |
| Real Submissions | No | Yes |
| Recommended Use | Before configuring classes | After testing |

---

## Sample Test Suite

Use these content types to calibrate your AI detection settings:

| Content Type | Description | Expected Result | Recommended Model | Recommended Method |
|--------------|-------------|-----------------|-------------------|-------------------|
| **Academic Essay** | Formal, thesis-driven | Varies | RoBERTa Large | Weighted |
| **ChatGPT Response** | Typical AI output | 70-95% AI | Any | Any |
| **Creative Writing** | Fiction, poetry | May show false positives | PirateXX | Strict |
| **Technical Report** | Data-heavy, factual | May show moderate AI | RoBERTa Large | Weighted |
| **Student Discussion Post** | Informal, short | May be unreliable | Any | Sentence granularity |
| **Paraphrased AI** | AI content rewritten | 30-60% AI | RoBERTa Large | Binary |
| **Citation-Heavy** | Many references | Should be low | Any | Weighted |

### How to Use This Table

1. Gather sample texts for each type relevant to your courses
2. Test in AI Lab using recommended settings
3. Document your findings for reference
4. Share with TAs for consistent grading

---

## Tips for Effective Testing

1. **Test Your Subject Matter**
   - Use actual assignment types from your courses
   - AI detection varies by discipline

2. **Build a Test Library**
   - Save sample texts for comparison
   - Include known AI, known human, and mixed

3. **Document Your Findings**
   - Note which settings work best for your needs
   - Consider creating guidelines for TAs

4. **Retest Periodically**
   - AI models are updated
   - Students adapt their AI use
   - Calibrate regularly

---

## Troubleshooting

### "Please enter at least 50 characters"
- Your text is too short
- Add more content and try again

### Analysis fails or times out
- Check your internet connection
- Model servers may be busy
- Try again in a few moments

### Unexpected results
- Try a different model
- Check if text contains unusual formatting
- Ensure text is actual prose (not code or data)

---

## Related Documentation

### Prerequisites
- [Platform Overview](./01-platform-overview.md) - Core concepts

### Deep Dives
- [AI Detection](./04-ai-detection.md) - Scoring methods explained
- [Assignments & Quizzes](./06-assignments-quizzes.md) - Configure assignments

### Apply Your Settings
- [Managing Classes](./03-managing-classes.md) - Apply to classes
