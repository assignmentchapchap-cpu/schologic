# Common Cartridge (IMSCC) & Open Educational Resources

## What is Common Cartridge?

**Common Cartridge (IMSCC)** is a standard file format for packaging and sharing educational content. Think of it as a "course in a box" that contains structured learning materials ready to import into any compatible LMS.

### What's Inside a Cartridge?

- **Chapters and Modules**: Organized content structure
- **HTML Pages**: Formatted text, images, formulas
- **Navigation**: Table of contents with hierarchy
- **Resources**: Images, videos, links
- **Metadata**: Title, author, description

---

## Why Use Common Cartridge?

### Benefits for Instructors

| Benefit | Description |
|---------|-------------|
| **Free Content** | Access thousands of peer-reviewed textbooks |
| **No Cost to Students** | Eliminate textbook expenses |
| **Quality Materials** | Professionally written, reviewed content |
| **Easy Distribution** | One file contains entire course |
| **Universal Format** | Works across LMS platforms |

### Popular OER Sources

| Source | Content Type | Website |
|--------|--------------|---------|
| **LibreTexts** | 500+ free textbooks | libretexts.org |
| **OpenStax** | College textbooks | openstax.org |
| **MIT OpenCourseWare** | University courses | ocw.mit.edu |
| **OER Commons** | Mixed resources | oercommons.org |

---

## Downloading IMSCC from LibreTexts

### Step-by-Step Process

1. **Visit LibreTexts**
   - Go to [libretexts.org](https://libretexts.org)
   - Browse by subject or search

2. **Find Your Textbook**
   - Use search: "Biology 101" or "Introduction to Psychology"
   - Browse categories: Chemistry, Mathematics, etc.

3. **Open the Textbook Page**
   - Click on the textbook title
   - View the book homepage

4. **Locate Download Options**
   - Look for **Download**, **Export**, or **Get This Book**
   - May be in sidebar or top menu

5. **Select Common Cartridge Format**
   - Choose **Common Cartridge** or **IMSCC**
   - Not PDF or other formats

6. **Download the File**
   - File saves as `.imscc`
   - Note: May be a large file (50-200 MB for full textbooks)

---

## Uploading IMSCC to Schologic

### Step-by-Step Process

1. **Go to Library**
   - Click **Library** in the sidebar

2. **Click Upload**
   - Find the upload button

3. **Select Your IMSCC File**
   - Browse to your downloaded file
   - Select the `.imscc` file

4. **Wait for Processing**
   - System extracts content
   - Parses `imsmanifest.xml`
   - Creates navigable structure
   - May take a minute for large files

5. **Cartridge Appears**
   - Shows in library with 📚 icon
   - Title extracted from package
   - Ready to use

### What Happens During Processing

```
Upload .imscc file
    ↓
System unzips archive
    ↓
Reads imsmanifest.xml
    ↓
Extracts title and metadata
    ↓
Parses table of contents
    ↓
Stores chapter structure
    ↓
Creates asset record
    ↓
Available in Library
```

---

## Viewing Cartridge Content

### Opening a Cartridge

1. **Find in Library**
   - Look for 📚 icon

2. **Click to Open**
   - Universal Reader launches

3. **Explore the Content**
   - Left sidebar shows Table of Contents
   - Chapters expand/collapse
   - Click any section to view

### Reader Features for Cartridges

| Feature | How to Use |
|---------|------------|
| **Table of Contents** | Click ☰ to toggle sidebar |
| **Navigate Chapters** | Click chapter titles to expand |
| **View Sections** | Click section to load content |
| **AI Summary** | Click ✨ to summarize section |

---

## Adding Cartridges to Classes

### Step-by-Step Process

1. **Open Your Class**
   - Navigate to the class

2. **Go to Resources Tab**
   - Click **Resources**

3. **Click Add from Library**
   - Opens asset picker

4. **Select the Cartridge**
   - Find your IMSCC asset
   - Check the selection box

5. **Click Add**
   - Cartridge linked to class
   - Students can access

### What Students See

- Cartridge listed in class resources
- Orange icon indicates course content
- Click opens Universal Reader
- Full navigation available

---

## IMSCC File Structure

Understanding the internal structure helps troubleshoot issues:

```
textbook.imscc (ZIP archive)
│
├── imsmanifest.xml          # Course structure & metadata
│   ├── <title>              # Book title
│   ├── <organization>       # TOC hierarchy
│   └── <resources>          # Content references
│
├── web_resources/
│   ├── chapter1/
│   │   ├── index.html       # Chapter content
│   │   └── images/          # Embedded images
│   ├── chapter2/
│   │   └── index.html
│   └── ...
│
├── wiki_content/            # Additional pages
│
└── resources/               # Supporting files
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `imsmanifest.xml` | Defines structure, required |
| `<organization>` | Table of contents tree |
| `<resources>` | Maps IDs to file paths |
| `web_resources/` | Actual HTML content |

---

## Troubleshooting Cartridge Issues

### "IMSCC not loading"

**Possible causes:**
- File corrupted during download
- Incompatible IMSCC version
- Missing imsmanifest.xml

**Solutions:**
1. Re-download from source
2. Check file isn't zero bytes
3. Try a different textbook

### "No content showing"

**Possible causes:**
- Content uses unsupported format
- External resources not embedded

**Solutions:**
1. Check if it's a partial export
2. Look for alternative version

### "Processing takes too long"

**Possible causes:**
- Very large file (200+ MB)
- Server load

**Solutions:**
1. Wait patiently (up to 2 minutes)
2. Try during off-peak hours
3. Consider smaller export if available

---

## Best Practices

### Choosing Content

1. **Check License**: Ensure CC or similar open license
2. **Review Content**: Preview before assigning to students
3. **Match Level**: Ensure appropriate for your course
4. **Current Edition**: Use latest available version

### Managing Cartridges

1. **Rename Clearly**: Use descriptive titles
2. **One per Subject**: Avoid duplicate textbooks
3. **Update Yearly**: Check for new versions

---

## Next Steps

- [Universal Reader](./10-universal-reader.md) - Full reader features
- [Resource Library](./08-resource-library.md) - Managing assets
- [Managing Classes](./03-managing-classes.md) - Linking resources
