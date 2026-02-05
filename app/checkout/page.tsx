'use client';

import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/cart';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const { items, clearCart } = useCartStore();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';

    // Auth check
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login?next=/checkout');
            }
        }
        checkAuth();
    }, [supabase.auth, router]);

    const handleMockPayment = async () => {
        setLoading(true);
        setError('');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            const res = await fetch(`${baseURL}/payments/mock-process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map((item) => item.id),
                    user_id: user.id
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to process payment');
            }

            const data = await res.json();
            console.log("Payment success:", data);

            // Clear cart and redirect
            // clearCart(); -> Moved to success page or here? better here to ensure clean state before nav, but success page usually clears it.
            // keeping it in success page logic if possible, but let's redirect.
            router.push('/checkout/success');

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900">
                <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                <button
                    onClick={() => router.push('/courses')}
                    className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg"
                >
                    Browse Courses
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-12 px-4">
            <h1 className="text-3xl font-bold mb-8">Checkout (Test Mode)</h1>

            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded mb-6 max-w-md w-full">
                    {error}
                </div>
            )}

            <div className="w-full max-w-xl bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
                    <div className="space-y-4">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between text-gray-400 border-b border-gray-700 pb-2">
                                <span>{item.title}</span>
                                <span>${item.price.toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between font-bold text-white mt-4 text-lg">
                            <span>Total</span>
                            <span>${items.reduce((acc, i) => acc + i.price, 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-200 text-sm mb-6">
                    <p className="font-bold mb-1">Testing Environment</p>
                    <p>This is a dummy checkout for development purposes. No real payment will be processed.</p>
                </div>

                <button
                    onClick={handleMockPayment}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {loading ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        "Complete Purchase (Mock)"
                    )}
                </button>
            </div>
        </div>
    );
}
