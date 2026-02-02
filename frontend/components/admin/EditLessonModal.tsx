'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface EditLessonModalProps {
    lesson: any;
    onClose: () => void;
    onLessonUpdated: (lesson: any) => void;
}

export function EditLessonModal({ lesson, onClose, onLessonUpdated }: EditLessonModalProps) {
    const [title, setTitle] = useState(lesson.title);
    const [type, setType] = useState(lesson.lesson_type);
    const [content, setContent] = useState(lesson.content || '');
    const [videoUrl, setVideoUrl] = useState(lesson.video_url || '');
    const [resourceUrl, setResourceUrl] = useState(lesson.resource_url || '');
    const [isFreePreview, setIsFreePreview] = useState(lesson.is_free_preview || false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            module_id: lesson.module_id,
            title,
            lesson_type: type,
            content,
            video_url: videoUrl,
            resource_url: resourceUrl,
            is_free_preview: isFreePreview,
            order: lesson.order,
        };

        console.log("Submitting Lesson Update:", payload);

        try {
            const res = await fetch(`http://localhost:8001/api/v1/lessons/${lesson.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to update lesson');
            const data = await res.json();
            onLessonUpdated(data);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to update lesson");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-6 border-b pb-2">Edit Lesson Details</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Lesson Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-blue outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full border rounded-lg p-2 bg-slate-50"
                            >
                                <option value="text">Article / Text</option>
                                <option value="video">Video</option>
                                <option value="quiz">Quiz</option>
                                <option value="assignment">Assignment</option>
                                <option value="pdf">PDF Resource</option>
                            </select>
                        </div>

                        <div className="flex items-center pt-6">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isFreePreview}
                                    onChange={(e) => setIsFreePreview(e.target.checked)}
                                    className="w-5 h-5 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
                                />
                                <span className="ml-2 text-sm text-slate-700 font-medium">Free Preview?</span>
                            </label>
                        </div>
                    </div>

                    {/* Dynamic Fields based on Type */}
                    {type === 'video' && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <label className="block text-sm font-medium mb-1 text-blue-900">Video Source</label>

                            {/* File Upload / URL Toggle */}
                            <div className="mb-3">
                                <label className="flex items-center gap-2 text-sm text-blue-800 mb-2">
                                    Upload Video File?
                                </label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    className="block w-full text-sm text-slate-500
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-full file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-blue-100 file:text-blue-700
                                      hover:file:bg-blue-200"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        // Upload
                                        const formData = new FormData();
                                        formData.append('file', file);

                                        try {
                                            e.target.disabled = true;
                                            const res = await fetch('http://localhost:8001/api/v1/upload', {
                                                method: 'POST',
                                                body: formData,
                                            });

                                            if (!res.ok) {
                                                const errText = await res.text();
                                                console.error("Upload failed details:", errText);
                                                throw new Error(`Status: ${res.status}. ${errText}`);
                                            }

                                            const data = await res.json();
                                            setVideoUrl(data.url);
                                            alert("Upload Complete! URL set.");
                                        } catch (err: any) {
                                            console.error("Upload error object:", err);
                                            alert(`Upload failed: ${err.message || 'Unknown error'}`);
                                        } finally {
                                            e.target.disabled = false;
                                        }
                                    }}
                                />
                                <p className="text-xs text-blue-600 mt-2">Or enter external URL below:</p>
                            </div>

                            <input
                                type="text"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                placeholder="http://... (Supabase or Vimeo URL)"
                                className="w-full border rounded-lg p-2"
                            />

                            {/* Video Preview */}
                            {videoUrl && (
                                <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 bg-black aspect-video relative group shadow-sm">
                                    <video
                                        src={videoUrl}
                                        controls
                                        className="w-full h-full"
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        Preview
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {type === 'pdf' && (
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                            <label className="block text-sm font-medium mb-1 text-orange-900">PDF Resource</label>
                            <input
                                type="file"
                                accept=".pdf"
                                className="block w-full text-sm text-slate-500 mb-2
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-full file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-orange-100 file:text-orange-700
                                      hover:file:bg-orange-200"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    try {
                                        const res = await fetch('http://localhost:8001/api/v1/upload', { method: 'POST', body: formData });
                                        if (!res.ok) {
                                            const errText = await res.text();
                                            throw new Error(`Status: ${res.status}. ${errText}`);
                                        }
                                        const data = await res.json();
                                        setResourceUrl(data.url);
                                        alert("PDF Uploaded Successfully!");
                                    } catch (e: any) {
                                        console.error("PDF Upload Error:", e);
                                        alert(`Upload failed: ${e.message}`);
                                    }
                                }}
                            />
                            <input
                                type="text"
                                value={resourceUrl} // Use resourceUrl
                                onChange={(e) => setResourceUrl(e.target.value)}
                                placeholder="PDF URL..."
                                className="w-full border rounded-lg p-2"
                            />
                        </div>
                    )}

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <label className="block text-sm font-medium mb-1">Content / Description</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-blue outline-none font-mono text-sm"
                            placeholder="# Markdown supported..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
