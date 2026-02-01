'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Step 2: Backend Validations (Frontend pre-check logic)

        // Password == Confirm Password
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        // Api Validation Call
        try {
            const validationRes = await fetch('/api/auth/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username })
            });

            if (!validationRes.ok) {
                const errorData = await validationRes.json();
                setError(errorData.error); // Will show "Email already registered..." or "Username already taken..."
                setLoading(false);
                return;
            }
        } catch (err) {
            setError("Validation failed. Please try again.");
            setLoading(false);
            return;
        }

        // Step 3: Create user record
        const supabase = createClient();
        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    username: username,
                    role: 'student',
                    // status: 'inactive' (handled by DB trigger default)
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (signUpError) {
            // Map Supabase errors to Generic/Spec messages if needed, but validation caught most.
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        // Ensure we don't accidentally login existing users (Step 5 - Scenario 3)
        // If session exists immediately, check if it's REALLY new
        if (data.session) {
            const createdAt = new Date(data.session.user.created_at).getTime();
            const now = new Date().getTime();
            // If account is older than 60 seconds, it's an old account -> Block
            if ((now - createdAt) > 60000) {
                await supabase.auth.signOut();
                setError("This email is already registered. Please login.");
                setLoading(false);
                return;
            }
        }

        // Step 4: Send verification email (Supabase does this automatically)
        // Response: "Verification Email Sent"

        setSuccess(true);
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
                <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Verification Email Sent</h2>
                    <p className="mt-4 text-sm text-slate-600">
                        We have sent a verification link to <span className="font-bold">{email}</span>.
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                        Please verify your email to continue.
                    </p>
                    <div className="mt-6">
                        <Link href="/login">
                            <Button variant="outline">Back to Login</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center items-center gap-2 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-brand-blue flex items-center justify-center text-white font-bold text-2xl">
                        W
                    </div>
                    <span className="font-heading font-bold text-3xl text-deep-navy tracking-tight">
                        World One
                    </span>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 font-heading">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-brand-blue hover:text-blue-500">
                        Sign in
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-100">
                    <form className="space-y-6" onSubmit={handleRegister}>
                        {/* Full Name */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                                Full Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                                Username
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email ID
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                                Confirm Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                                disabled={loading}
                            >
                                {loading ? 'Create Account' : 'Create Account'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
