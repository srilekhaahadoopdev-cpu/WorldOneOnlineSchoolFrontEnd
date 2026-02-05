'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export function DashboardNavbar() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, full_name')
                    .eq('id', user.id)
                    .single();
                setProfile(profile);
            }
        };
        fetchUser();
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const isAdmin = profile?.role === 'admin' || profile?.role === 'instructor' || user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'instructor';

    return (
        <nav className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/dashboard" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-white font-bold text-lg">
                                W
                            </div>
                            <span className="font-heading font-bold text-xl text-deep-navy hidden sm:block">
                                World One <span className="text-slate-400 font-normal text-sm ml-1">Portal</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                href="/dashboard"
                                className="border-transparent text-slate-500 hover:border-brand-blue hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Dashboard
                            </Link>

                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className="border-transparent text-brand-blue hover:border-brand-blue hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold"
                                >
                                    Admin Panel
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-600 hidden md:block">
                                {profile?.full_name || user?.email}
                            </span>
                            <div className="h-8 w-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold border border-brand-blue/20">
                                {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSignOut}
                            className="ml-2 text-xs"
                        >
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
