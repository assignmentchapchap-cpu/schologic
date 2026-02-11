# Troubleshooting & FAQ

## Common Issues

### AI Detection Issues

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| AI score always 0% | Text too short | Minimum 50 characters required |
| AI score seems wrong | Model variation | Test in AI Lab with different models |
| No segment breakdown | Analysis failed | Retry or check text formatting |
| Very high score on human text | Model false positive | Consider Strict scoring method |

### Submission Issues

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| "Submission failed" | Network error | Retry, check connection |
| Can't submit | Due date passed | Check if late submissions allowed |
| File won't upload | Wrong format | Use DOCX or TXT only |
| Text not extracted | Corrupted file | Recreate file, try plain text |

### Class Issues

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| Students can't join | Class is locked | Unlock in class settings |
| Invalid invite code | Code copied wrong | Verify exact 6 characters |
| Resources not showing | Not linked to class | Add via Resources tab |

### Rubric Issues

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| Rubric not generating | Description too vague | Add detailed assignment description |
| Wrong point distribution | AI interpretation | Edit rubric manually after generation |
| AI grading fails | API error | Retry, check API status |

### IMSCC/Cartridge Issues

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| Upload fails | File too large | May need to wait longer |
| Content not showing | Bad IMSCC file | Re-download from source |
| Processing stuck | Server load | Wait a few minutes, retry |
| TOC empty | Malformed manifest | Try different textbook version |

---

## Frequently Asked Questions

### General

**Q: What browsers are supported?**
A: Modern browsers (Chrome, Firefox, Safari, Edge). Latest versions recommended.

**Q: Is there a mobile app?**
A: Not currently. The web app works on mobile browsers.

**Q: Can I use Schologic offline?**
A: No, internet connection required.

---

### AI Detection

**Q: Can students see their AI scores?**
A: Yes, students see their AI score immediately after submission.

**Q: How accurate is AI detection?**
A: AI detection provides probability scores. It's a tool to inform decisions, not definitive proof of AI use.

**Q: Does AI detection work on all languages?**
A: Best results with English. Other languages may have reduced accuracy.

**Q: Can students "trick" the AI detection?**
A: Paraphrasing and editing may reduce scores. No detection is perfect.

**Q: What if AI score is high but student didn't use AI?**
A: Discuss with student. Some writing styles score higher. Use as one data point.

**Q: Can I re-run AI analysis on a submission?**
A: Not currently. Analysis runs once at submission time.

---

### Grading

**Q: Can I override AI-suggested grades?**
A: Yes, AI grades are suggestions. You enter the final grade.

**Q: Do students see the rubric breakdown?**
A: If you provide it, yes. Rubric feedback shows to students.

**Q: Can TAs use the grading features?**
A: Currently, only the instructor account owner.

---

### Library & Resources

**Q: What file types can I upload?**
A: PDF, DOCX, TXT, IMSCC. Other formats may upload but won't preview.

**Q: Is there a storage limit?**
A: 20 MB per instructor. Demo accounts: 3 files max.

**Q: Can students upload to the library?**
A: No, library is instructor-only. Students submit to assignments.

---

### Common Cartridge

**Q: Where do LibreTexts cartridges come from?**
A: Download from libretexts.org in Common Cartridge format.

**Q: Can I create my own IMSCC?**
A: Yes, if you have IMSCC authoring tools. Upload like any other cartridge.

**Q: Why is my cartridge taking long to process?**
A: Large cartridges (100+ MB) need time. Wait a few minutes.

---

### Students

**Q: How do students reset their password?**
A: Use "Forgot Password" on login page.

**Q: Can a student be in multiple classes?**
A: Yes, students can join any class with a valid code.

**Q: What if a student submits wrong file?**
A: Depending on settings, they may resubmit or you can reset.

---

## Error Messages

### "Unauthorized"
- Session expired or not logged in
- Log out and log back in

### "Missing API Key"
- Server configuration issue
- Contact system administrator

### "Analysis failed"
- AI service temporarily unavailable
- Wait a moment and retry

### "Storage quota exceeded"
- You've used all 20 MB
- Delete unused assets

### "Demo limit reached"
- Demo accounts have restrictions
- Upgrade for full access

---

## Getting Help

### Instant Help Chatbot (Recommended)

The fastest way to get help is the **Schologic Help Assistant**:

1. Click the **chat bubble** icon (bottom corner of any page)
2. Type your question in natural language
3. Get instant answers based on this knowledge base

**Available 24/7** — no waiting for support tickets!

### What to Include in Support Requests

If the chatbot can't resolve your issue:

1. **Describe the issue clearly**
2. **Include error messages** (exact text)
3. **Steps to reproduce**
4. **Browser and device** used
5. **Screenshots** if applicable

### Before Contacting Support

1. Ask the Help Chatbot first
2. Check this FAQ
3. Try a different browser
4. Clear browser cache
5. Check internet connection
6. Wait and retry (for server issues)

---

## Quick Reference

### Key Limits

| Limit | Value |
|-------|-------|
| Demo file uploads | 3 files |
| Storage quota | 20 MB |
| Min text for AI | 50 characters |
| Invite code length | 6 characters |

### Default Settings

| Setting | Default |
|---------|---------|
| AI Model | RoBERTa Large |
| Granularity | Paragraph |
| Scoring Method | Weighted |

---

## Next Steps

- [Getting Started](./02-getting-started.md) - Initial setup
- [AI Detection](./04-ai-detection.md) - Understanding AI
- [Platform Overview](./01-platform-overview.md) - Full feature list
