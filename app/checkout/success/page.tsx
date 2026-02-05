'use client';
import { useEffect } from 'react';
import { useCartStore } from '@/lib/store/cart';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
    const { clearCart } = useCartStore();

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 text-center max-w-md w-full">
                <div className="flex justify-center mb-6">
                    <CheckCircle className="w-20 h-20 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
                <p className="text-gray-400 mb-8">
                    Thank you for your purchase. Your content has been adding to your dashboard.
                </p>
                <Link
                    href="/dashboard"
                    className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    )
}
