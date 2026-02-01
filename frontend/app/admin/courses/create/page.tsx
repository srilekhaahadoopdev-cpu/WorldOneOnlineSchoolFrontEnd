'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function CreateCoursePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        price: '0.00',
        level: 'Primary School',
        thumbnail_url: ''
    });

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        // Auto-generate slug from title if slug hasn't been manually edited
        // Simple slugify: lowercase, replace spaces with hyphens, remove non-alphanumeric
        const autoSlug = title
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');

        setFormData(prev => ({
            ...prev,
            title,
            slug: prev.slug && prev.slug !== autoSlug && !title.startsWith(prev.slug.replace(/-/g, ' ')) ? prev.slug : autoSlug
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
            const res = await fetch(`${apiUrl}/courses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price) || 0,
                    // Send empty string as null for thumbnail if needed, or backend handles Optional
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to create course');
            }

            // Success
            // const data = await res.json();
            router.push('/admin');
            router.refresh(); // Refresh server components
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/admin" className="text-sm text-slate-500 hover:text-brand-blue mb-2 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-deep-navy font-heading">Create New Course</h1>
                    <p className="text-slate-600 mt-2">Start by filling in the basic details for your new course.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-bold text-deep-navy mb-1.5">
                            Course Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            required
                            value={formData.title}
                            onChange={handleTitleChange}
                            placeholder="e.g. Advanced Mathematics"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label htmlFor="slug" className="block text-sm font-bold text-deep-navy mb-1.5">
                            URL Slug <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center">
                            <span className="bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg px-3 py-2 text-slate-500 text-sm">
                                .../courses/
                            </span>
                            <input
                                type="text"
                                id="slug"
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="advanced-mathematics"
                                className="flex-1 px-4 py-2 rounded-r-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all font-mono text-sm"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-bold text-deep-navy mb-1.5">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            required
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief summary of what students will learn..."
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Price */}
                        <div>
                            <label htmlFor="price" className="block text-sm font-bold text-deep-navy mb-1.5">
                                Price ($)
                            </label>
                            <input
                                type="number"
                                id="price"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        {/* Level */}
                        <div>
                            <label htmlFor="level" className="block text-sm font-bold text-deep-navy mb-1.5">
                                Level
                            </label>
                            <select
                                id="level"
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all bg-white"
                            >
                                <option value="Primary School">Primary School</option>
                                <option value="Middle School">Middle School</option>
                                <option value="High School">High School</option>
                            </select>
                        </div>
                    </div>

                    {/* Thumbnail URL */}
                    <div>
                        <label htmlFor="thumbnail_url" className="block text-sm font-bold text-deep-navy mb-1.5">
                            Thumbnail URL (Optional)
                        </label>
                        <p className="text-xs text-slate-500 mb-2">
                            Enter an image URL or a valid Tailwind gradient class (e.g. 'bg-gradient-to-r from-blue-500 to-cyan-500').
                        </p>
                        <input
                            type="text"
                            id="thumbnail_url"
                            value={formData.thumbnail_url}
                            onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                            placeholder="https://... or bg-gradient-..."
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                        <Link href="/admin">
                            <Button variant="ghost" type="button">Cancel</Button>
                        </Link>
                        <Button
                            type="submit"
                            className="bg-brand-gold hover:bg-yellow-500 text-deep-navy font-bold shadow-md shadow-brand-gold/20"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating...' : 'Create Course'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
