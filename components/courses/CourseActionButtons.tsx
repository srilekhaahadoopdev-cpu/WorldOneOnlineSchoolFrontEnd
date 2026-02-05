'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/lib/store/cart';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface CourseActionButtonsProps {
    course: {
        id: string;
        title: string;
        price: number;
        slug: string;
        thumbnail_url: string;
    };
    isEnrolledInitial?: boolean;
}

export default function CourseActionButtons({ course, isEnrolledInitial = false }: CourseActionButtonsProps) {
    const { addItem, isInCart } = useCartStore();
    const router = useRouter();
    const [isEnrolled, setIsEnrolled] = useState(isEnrolledInitial);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const checkEnrollment = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from('enrollments')
                .select('id')
                .eq('user_id', user.id)
                .eq('course_id', course.id)
                .single();

            if (data) {
                setIsEnrolled(true);
            }
            setLoading(false);
        };
        checkEnrollment();
    }, [course.id, supabase]);

    const handleEnroll = () => {
        addItem({
            id: course.id,
            title: course.title,
            price: course.price,
            thumbnail_url: course.thumbnail_url
        });
        router.push('/checkout');
    };

    if (loading) {
        return <div className="text-white/50 text-sm">Checking status...</div>;
    }

    if (isEnrolled) {
        return (
            <Link href={`/courses/${course.slug}/learn`}>
                <Button size="lg" className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 w-full sm:w-auto shadow-lg shadow-green-900/20">
                    ▶ Continue Learning
                </Button>
            </Link>
        );
    }

    const inCart = isInCart(course.id);

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {inCart ? (
                <Button
                    onClick={() => router.push('/checkout')}
                    size="lg"
                    className="bg-brand-gold hover:bg-yellow-500 text-deep-navy font-bold px-8 w-full sm:w-auto shadow-lg shadow-brand-gold/20"
                >
                    Go to Checkout
                </Button>
            ) : (
                <Button
                    onClick={handleEnroll}
                    size="lg"
                    className="bg-brand-gold hover:bg-yellow-500 text-deep-navy font-bold px-8 w-full sm:w-auto shadow-lg shadow-brand-gold/20"
                >
                    {course.price > 0 ? `Enroll for $${course.price}` : 'Enroll for Free'}
                </Button>
            )}

            {/* 
            We hide "Start Learning" if not enrolled.
            Or we can show it but make it redirect to enrollment if clicked?
            The user said "IT TAKES ME TO ALL LESSONS IN FREE BUT IT SHOULD HAVE AVOIDED".
            So let's only show it if enrolled (handled above).
            */}
        </div>
    );
}
