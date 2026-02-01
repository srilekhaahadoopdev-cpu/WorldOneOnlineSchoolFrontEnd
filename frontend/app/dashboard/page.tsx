'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const supabase = createClient();

            // Get User
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Get Profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(profile);
            }
            setLoading(false);
        };

        fetchUserData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;
    }

    return (
        <div className="px-4 py-8 sm:px-0">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Student Dashboard</h1>

            <div className="bg-white shadow rounded-lg p-6 border border-slate-100 mb-8">
                <h2 className="text-lg font-semibold text-slate-700 mb-4">Welcome back, {profile?.full_name || user?.email}!</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                    <div className="p-3 bg-slate-50 rounded">
                        <span className="font-bold block text-slate-400 text-xs uppercase">Email</span>
                        {user?.email}
                    </div>
                    <div className="p-3 bg-slate-50 rounded">
                        <span className="font-bold block text-slate-400 text-xs uppercase">Role</span>
                        {profile?.role || 'Student'}
                    </div>
                    <div className="p-3 bg-slate-50 rounded">
                        <span className="font-bold block text-slate-400 text-xs uppercase">User ID</span>
                        <code className="text-xs">{user?.id}</code>
                    </div>
                    <div className="p-3 bg-slate-50 rounded">
                        <span className="font-bold block text-slate-400 text-xs uppercase">Profile Status</span>
                        {profile ? <span className="text-green-600">Active</span> : <span className="text-red-500">Profile Missing</span>}
                    </div>
                </div>
            </div>

            <div className="border-4 border-dashed border-slate-200 rounded-lg h-64 flex flex-col items-center justify-center text-slate-400">
                <span className="text-lg font-medium">Enrolled Courses will appear here</span>
            </div>
        </div>
    );
}
