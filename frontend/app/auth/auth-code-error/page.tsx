'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function AuthCodeErrorPage() {
    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Authentication Error</h2>
                <p className="mt-2 text-sm text-slate-600">
                    We were unable to verify your email address. The link may have expired or is invalid.
                </p>
                <div className="mt-6 space-y-4">
                    <Link href="/login">
                        <Button variant="primary">Return to Login</Button>
                    </Link>
                    <div className="text-sm">
                        <Link href="/register" className="font-medium text-brand-blue hover:text-blue-500">
                            Create a new account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
