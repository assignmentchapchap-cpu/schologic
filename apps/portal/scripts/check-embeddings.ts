import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load env vars manually from apps/portal/.env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            process.env[key] = value;
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
    console.error('Looked in:', envPath);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEmbeddings() {
    console.log('Checking kb_embeddings table...');

    // Check if table exists and has data
    try {
        const { count, error } = await supabase
            .from('kb_embeddings')
            .select('*', { count: 'exact', head: true });

        if (error) {
            if (error.code === '42P01') { // undefined_table
                console.log('Table kb_embeddings does not exist.');
            } else {
                console.error('Error querying table:', error);
            }
        } else {
            console.log(`Found ${count} existing embeddings.`);
        }
    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

checkEmbeddings();
