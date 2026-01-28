# Universal Reader

## Overview

The Universal Reader is Schologic's built-in document viewer. It supports multiple formats and includes AI-powered features to enhance the reading experience.

### Supported Formats

| Format | Extension | Features |
|--------|-----------|----------|
| **PDF** | .pdf | Page-by-page viewing, zoom |
| **Word Document** | .docx | Rendered preview, text extraction |
| **Common Cartridge** | .imscc | TOC navigation, chapter browsing |
| **Plain Text** | .txt | Formatted display |

---

## Opening Documents

### From Library

1. Go to **Library**
2. Click on any document asset
3. Universal Reader opens

### From Class Resources

1. Open a class
2. Go to **Resources** tab
3. Click the **Read** button on any resource

### From Submissions

1. Open a student submission
2. If file was uploaded, click to view

---

## Reader Interface

### Layout

```
┌─────────────────────────────────────────────────────┐
│  [☰]  Document Title              [🔍] [⛶] [✕]    │ ← Header
├───────────┬─────────────────────────────────────────┤
│           │                                         │
│  Outline  │         Main Content Area               │
│  Sidebar  │                                         │
│           │                           [+] Zoom     │
│  (TOC)    │                           [-]          │
│           │                           100%         │
│           │                                         │
│           │                           [✨ AI]      │ ← AI Button
│           │                                         │
├───────────┴─────────────────────────────────────────┤
│           AI Sidebar (when open)                    │
└─────────────────────────────────────────────────────┘
```

### Header Elements

| Element | Function |
|---------|----------|
| **☰ Outline Toggle** | Show/hide table of contents |
| **Document Title** | Current file name |
| **🔍 Search** | Find text in document |
| **⛶ Maximize** | Full-screen mode |
| **✕ Close** | Exit reader |

---

## Reader Features

### Zoom Controls

**Location:** Floating panel on right side of content

| Button | Action |
|--------|--------|
| **+** | Zoom in (up to 200%) |
| **100%** | Reset to default (click percentage) |
| **−** | Zoom out (down to 50%) |

### Search (Find in Document)

**Steps:**
1. Click the 🔍 (search) icon
2. Search bar appears
3. Type your search term
4. Press Enter or click arrows to navigate matches
5. Current match highlighted
6. Shows "X/Y" for match count

**Note:** Search is disabled for IMSCC cartridges (cross-origin content).

### Outline/Table of Contents

**Steps:**
1. Click ☰ (outline) button
2. Sidebar slides in from left
3. For cartridges: full chapter hierarchy
4. Click any section to navigate
5. Click ☰ again to close

### Maximize Mode

**Steps:**
1. Click ⛶ (maximize) button
2. Reader fills entire screen
3. Click again to exit

---

## AI Features in Reader

### AI Summarization

The Reader includes an AI Assistant that can summarize documents.

**Steps to Summarize:**

1. **Open Any Document**
   - PDF, DOCX, or IMSCC

2. **Click AI Assistant Button**
   - Look for ✨ (sparkle) button
   - Usually in bottom-right corner

3. **AI Sidebar Opens**
   - Shows "AI Assistant" panel

4. **Click Summarize Document**
   - Opens configuration dialog

5. **Configure Summary Options**
   
   | Option | Description |
   |--------|-------------|
   | **Context** | What to focus on (e.g., "for exam prep") |
   | **Pages** | Specific page range (for long docs) |
   | **Sections** | Select chapters (for IMSCC) |

6. **Generate Summary**
   - Click **Summarize**
   - AI processes document
   - Results appear as bullet points

7. **Review Summary**
   - Key points listed
   - Clear to regenerate

### IMSCC Section Selection

For cartridges, you can select specific sections to summarize:

1. Open summarize dialog
2. See checkbox tree of chapters
3. Check sections you want included
4. Generate summary for selected only

---

## Viewing Different Formats

### PDF Documents

- Page-by-page navigation
- Scroll through content
- Zoom for readability
- Search works normally

### Word Documents

- Rendered HTML preview
- Formatting preserved (mostly)
- Zoom available
- Text searchable

### Common Cartridge (IMSCC)

- Left sidebar shows TOC
- Chapters expand/collapse
- Click sections to view
- Content loads in main area
- AI summary available

### Plain Text

- Clean, formatted display
- Monospace or readable font
- Zoom available
- Full search support

---

## Tips for Best Experience

### Large Documents

- Use zoom to adjust readability
- Use search to find specific content
- For cartridges, use TOC navigation

### On Mobile/Small Screens

- Outline overlays content
- Tap to toggle sidebar
- Portrait orientation recommended
- Full-screen improves readability

### Performance

- Large PDFs may load slowly
- IMSCC content streams as needed
- Close unused reader tabs

---

## Troubleshooting

### "Preview not available"

- File format not supported
- Download link provided instead

### Search not finding text

- Text may be in images (OCR not supported)
- Check spelling
- IMSCC cartridges don't support search

### Content not displaying

- Check internet connection
- Try refreshing
- Large files need time to load

---

## Next Steps

- [Common Cartridge](./09-common-cartridge.md) - IMSCC specifics
- [Resource Library](./08-resource-library.md) - Managing documents
- [Student Workflows](./12-student-workflows.md) - How students use reader
