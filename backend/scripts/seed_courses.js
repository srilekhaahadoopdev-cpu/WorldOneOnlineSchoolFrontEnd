
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse .env.local from the parent directory
const envPath = path.join(__dirname, '../../frontend/.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const url = env['NEXT_PUBLIC_SUPABASE_URL'];
// Ideally we need service_role key to bypass RLS for seeding, but if policies allow insert for now:
// Let's assume we might need to be careful. For this script, we'll try to use the ANON KEY 
// but usually seeding requires Service Role. 
// Let's check backend .env for Service Role Key as fallback.
let key = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

// Try to find service role key in backend .env if possible
try {
    const backendEnvPath = path.join(__dirname, '../../backend/.env');
    if (fs.existsSync(backendEnvPath)) {
        const backendEnvContent = fs.readFileSync(backendEnvPath, 'utf8');
        backendEnvContent.split('\n').forEach(line => {
            if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
                const serviceKey = line.split('=')[1].trim();
                if (serviceKey && serviceKey !== 'YOUR_SERVICE_ROLE_KEY') {
                    console.log("Found Service Role Key! Switching to admin mode.");
                    key = serviceKey;
                }
            }
        });
    }
} catch (e) {
    console.log("Could not read backend .env, proceeding with Anon Key");
}

if (!url || !key) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(url, key);

async function runMigration() {
    const sqlPath = path.join(__dirname, '../database/phase3_courses.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Running SQL migration...");

    // Supabase JS client doesn't support raw SQL execution directly via public API usually.
    // However, we can use the RPC call if we had a function, or just use the dashboard.
    // A better approach for the USER is to ask them to run it via Dashboard SQL Editor.

    console.log("----------------------------------------------------------------");
    console.log("⚠️ AUTOMATED SQL MIGRATION IS NOT SUPPORTED VIA JS CLIENT DIRECTLY");
    console.log("Please copy the content of 'backend/database/phase3_courses.sql' and run it in your Supabase SQL Editor.");
    console.log("----------------------------------------------------------------");
    console.log("SQL File Location:", sqlPath);
}

runMigration();
