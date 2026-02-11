
import { createClient } from "../packages/database/src/index";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function inspect() {
    const supabase = createClient();

    console.log("Fetching Practicums...");
    const { data: practicums, error } = await supabase
        .from('practicums')
        .select('*')
        .limit(5);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Practicums:", JSON.stringify(practicums, null, 2));
    }
}

inspect();
