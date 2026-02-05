'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function SystemCheck() {
    const [supabaseStatus, setSupabaseStatus] = useState<'loading' | 'connected' | 'error'>('loading');
    const [backendStatus, setBackendStatus] = useState<'loading' | 'connected' | 'error'>('loading');
    const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'guest'>('loading');
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function checkSystems() {
        setErrorMessage(null);
        setSupabaseStatus('loading');
        setBackendStatus('loading');
        setAuthStatus('loading');

        // 1. Check Supabase & Auth
        try {
            const supabase = createClient();
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) throw error;
            setSupabaseStatus('connected');

            if (session?.user) {
                setAuthStatus('authenticated');
                setUserEmail(session.user.email || 'No email');
            } else {
                setAuthStatus('guest');
                setUserEmail(null);
            }

        } catch (err: any) {
            console.error("Supabase Error:", err);
            setSupabaseStatus('error');
            setErrorMessage(prev => (prev ? prev + '\n' : '') + `Supabase: ${err.message}`);
        }

        // 2. Check Backend API
        try {
            const res = await apiClient.get('/health');
            if (res.status === 200 && res.data.status === 'ok') {
                setBackendStatus('connected');
            } else {
                throw new Error('Invalid response from backend');
            }
        } catch (err: any) {
            console.error("Backend Error:", err);
            setBackendStatus('error');
            setErrorMessage(prev => (prev ? prev + '\n' : '') + `Backend: ${err.message || 'Connection failed'}`);
        }
    }

    useEffect(() => {
        checkSystems();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <h1 className="font-heading text-2xl font-bold text-deep-navy mb-6 text-center">
                    System Diagnostics
                </h1>

                <div className="space-y-4">
                    {/* Supabase Check */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="font-medium text-slate-700">Supabase Connection</span>
                        <StatusBadge status={supabaseStatus} />
                    </div>

                    {/* Backend Check */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="font-medium text-slate-700">FastAPI Backend</span>
                        <StatusBadge status={backendStatus} />
                    </div>

                    {/* Auth Check */}
                    <div className="flex flex-col p-4 rounded-lg bg-blue-50 border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-slate-700">Authentication</span>
                            {authStatus === 'loading' && <span className="text-slate-400 text-sm">Checking...</span>}
                            {authStatus === 'authenticated' && <span className="text-green-600 font-bold text-sm">Logged In</span>}
                            {authStatus === 'guest' && <span className="text-slate-500 font-semibold text-sm">Guest</span>}
                        </div>

                        {authStatus === 'authenticated' ? (
                            <div className="text-sm text-slate-600">
                                User: <span className="font-mono text-brand-blue">{userEmail}</span>
                                <div className="mt-3">
                                    <Link href="/dashboard">
                                        <Button size="sm" variant="outline" className="w-full">Go to Dashboard</Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-2 flex gap-2">
                                <Link href="/login" className="flex-1">
                                    <Button size="sm" variant="primary" className="w-full">Login</Button>
                                </Link>
                                <Link href="/register" className="flex-1">
                                    <Button size="sm" variant="outline" className="w-full">Register</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {errorMessage && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-md font-mono whitespace-pre-wrap">
                            {errorMessage}
                        </div>
                    )}

                    <div className="pt-4 text-center">
                        <Button onClick={checkSystems} variant="ghost" size="sm">
                            Refresh Diagnostics
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: 'loading' | 'connected' | 'error' }) {
    if (status === 'loading') {
        return (
            <span className="text-yellow-600 text-sm font-semibold flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse" />
                Checking...
            </span>
        );
    }
    if (status === 'connected') {
        return (
            <span className="text-green-600 text-sm font-bold flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Connected
            </span>
        );
    }
    return (
        <span className="text-red-600 text-sm font-bold flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
            Failed
        </span>
    );
}
