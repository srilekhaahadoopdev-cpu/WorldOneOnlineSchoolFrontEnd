
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse .env.local from the parent directory (frontend root)
const envPath = path.join(__dirname, '../.env.local');
console.log(`Reading env from: ${envPath}`);

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            env[key.trim()] = value.trim();
        }
    });

    const url = env['NEXT_PUBLIC_SUPABASE_URL'];
    const key = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

    if (!url || !key) {
        console.error('❌ Missing credentials in .env.local');
        process.exit(1);
    }

    console.log(`Testing connection to: ${url}`);
    const supabase = createClient(url, key);

    async function testConnection() {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('❌ Connection Failed:', error.message);
        } else {
            console.log('✅ Connection Successful! (Supabase is reachable)');
        }
    }

    testConnection();

} catch (err) {
    console.error("Error reading .env.local:", err.message);
}
