const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, 'apps/portal/src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

function migrate() {
    const files = walk(TARGET_DIR);
    let count = 0;

    files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;

        // Replace @/lib/supabase with @schologic/database
        // Regex looks for: from ['"]@/lib/supabase['"] (and NOT -server)
        const supabaseRegex = /from\s+['"]@\/lib\/supabase['"]/g;
        if (supabaseRegex.test(content)) {
            content = content.replace(supabaseRegex, 'from "@schologic/database"');
            modified = true;
        }

        // Replace @/lib/database.types with @schologic/database
        const typesRegex = /from\s+['"]@\/lib\/database\.types['"]/g;
        if (typesRegex.test(content)) {
            content = content.replace(typesRegex, 'from "@schologic/database"');
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Updated: ${file}`);
            count++;
        }
    });

    console.log(`Migration Complete. Updated ${count} files.`);
}

migrate();
