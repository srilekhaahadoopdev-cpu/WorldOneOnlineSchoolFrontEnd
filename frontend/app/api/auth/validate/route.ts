
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email, username } = await request.json();
        const supabase = await createClient(); // Use server client

        // Check Email
        if (email) {
            const { data: emailUser } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', email)
                .single();

            if (emailUser) {
                return NextResponse.json(
                    { error: 'Email already registered. Please login.' },
                    { status: 409 }
                );
            }
        }

        // Check Username
        if (username) {
            const { data: usernameUser } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', username)
                .single();

            if (usernameUser) {
                return NextResponse.json(
                    { error: 'Username already taken. Choose another.' },
                    { status: 409 }
                );
            }
        }

        return NextResponse.json({ valid: true });

    } catch (error) {
        console.error('Validation error:', error);
        return NextResponse.json({ error: 'Validation check failed' }, { status: 500 });
    }
}
