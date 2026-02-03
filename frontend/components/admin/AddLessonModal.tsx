'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface AddLessonModalProps {
    moduleId: string;
    onClose: () => void;
    onLessonAdded: (lesson: any) => void;
}

export function AddLessonModal({ moduleId, onClose, onLessonAdded }: AddLessonModalProps) {
    // Robust API URL detection
    const getApiUrl = () => {
        const envUrl = process.env.NEXT_PUBLIC_API_URL;
        // If we are in the browser (client-side)
        if (typeof window !== 'undefined') {
            // If we are NOT on localhost...
            if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                // ...but the ENV VAR is set to localhost, ignore it and use relative path
                if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
                    return '/api/v1';
                }
            }
        }
        return envUrl || '/api/v1';
    };
    const API_URL = getApiUrl();
    const [title, setTitle] = useState('');
    const [type, setType] = useState('text');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`${API_URL}/lessons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    module_id: moduleId,
                    title,
                    lesson_type: type,
                    order: 99, // Backend should handle order or frontend pass length
                }),
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error("Lesson creation failed:", errText);
                throw new Error(`Failed to create lesson: ${res.status} ${errText}`);
            }
            const data = await res.json();
            onLessonAdded(data);
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(`Error creating lesson (${API_URL}): ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <h3 className="text-xl font-bold mb-4">Add New Lesson</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Lesson Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border rounded-lg p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full border rounded-lg p-2"
                        >
                            <option value="text">Article / Text</option>
                            <option value="video">Video</option>
                            <option value="quiz">Quiz</option>
                            <option value="assignment">Assignment</option>
                            <option value="pdf">PDF Resource</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Lesson'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
