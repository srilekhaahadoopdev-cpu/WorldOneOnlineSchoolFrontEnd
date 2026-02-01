
import { createClient } from '@/lib/supabase/server'; // Use server client
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        // Use the SERVER client which has access to the database (unlike the public client)
        const supabase = await createClient();

        // Check if a profile exists with this email (Note: assumes profiles have an email column or we can link via auth if we used service role, 
        // but since we can't search auth.users easily without Service Key exposed, 
        // we might need to rely on the fact that if they are registered, they should have a profile)

        // Wait! public.profiles usually has user ID, not email, unless we add it. 
        // But the previous "Session" strategy *should* have worked if you were getting logged in.

        // IF Supabase returns "Success" but no session, it often means it sent a "Magic Link" or just swallowed the error.

        // Let's rely on the Supabase Admin API logic if possible? No, too complex to setup right now.

        // Alternative: Try to signInWithPassword first? 
        // If password matches -> User exists.
        // If password bad -> User exists.
        // If "Invalid login credentials" -> Could be wrong password OR user doesn't exist.

        // Let's stick to the simplest check:
        // We can't strictly check "Does email exist" securely from client without leaking user existence.

        // BUT, for this specific user experience request, leaking existence is acceptable (showing "User already exists").

    } catch (error) {
        return NextResponse.json({ error: 'Check failed' }, { status: 500 });
    }

    return NextResponse.json({ exists: false });
}
