const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    "src/components/use-cases/universities/UniversitiesPilotCTA.tsx",
    "src/components/use-cases/tvet/TvetPilotCTA.tsx",
    "src/components/use-cases/colleges/CollegesPilotCTA.tsx",
    "src/components/landing/LightHero.tsx",
    "src/components/features/practicum-manager/PracticumManagerFAQ.tsx",
    "src/app/use-cases/universities/page.tsx",
    "src/app/use-cases/tvet/page.tsx",
    "src/app/use-cases/colleges/page.tsx",
    "src/app/pricing/page.tsx",
    "src/app/HomeClient.tsx",
    "src/app/features/class-manager/page.tsx",
    "src/app/features/page.tsx",
    "src/app/features/universal-reader/page.tsx",
    "src/app/features/practicum-manager/page.tsx",
    "src/app/features/ai-detection/page.tsx",
    "src/app/pilot/pilot-knowledge-base/page.tsx"
];

for (const rel of filesToUpdate) {
    const file = path.join(__dirname, rel);
    let content = fs.readFileSync(file, 'utf8');

    let changed = false;

    if (content.match(/href="\/pilot"/g) || content.match(/ctaHref="\/pilot"/g) || content.match(/href: "\/pilot"/g) || content.match(/href="\/pilot"/g)) {
        // Add import
        if (!content.includes("getPilotUrl")) {
            const lastImportIndex = content.lastIndexOf("import ");
            if (lastImportIndex !== -1) {
                const endOfLastImport = content.indexOf("\n", lastImportIndex) + 1;
                content = content.slice(0, endOfLastImport) + "import { getPilotUrl } from '@/lib/urls';\n" + content.slice(endOfLastImport);
            } else {
                content = "import { getPilotUrl } from '@/lib/urls';\n" + content;
            }
        }

        // Replace
        content = content.replace(/href="\/pilot"/g, "href={getPilotUrl()}");
        content = content.replace(/ctaHref="\/pilot"/g, "ctaHref={getPilotUrl()}");
        content = content.replace(/href: "\/pilot"/g, "href: getPilotUrl()");
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content);
        console.log("Updated", rel);
    }
}
