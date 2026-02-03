'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

interface AssignmentUploadProps {
    lessonId: string;
}

export default function AssignmentUpload({ lessonId }: AssignmentUploadProps) {
    const [assignment, setAssignment] = useState<any>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [comments, setComments] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                const res = await fetch(`${API_URL}/lessons/${lessonId}/assignment`);
                if (res.ok) {
                    const data = await res.json();
                    setAssignment(data);
                }
            } catch (err) {
                console.error("Failed to fetch assignment", err);
            }
        };
        fetchAssignment();
    }, [lessonId, API_URL]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignment || !file) return;

        setUploading(true);
        setError(null);
        setSuccess(false);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error("You must be logged in.");
            }

            // 1. Upload File
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error("File upload failed");
            const { url: fileUrl } = await uploadRes.json();

            // 2. Submit Assignment
            const payload = {
                assignment_id: assignment.id,
                user_id: user.id,
                file_url: fileUrl,
                comments: comments
            };

            const submitRes = await fetch(`${API_URL}/assessments/upload-assignment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!submitRes.ok) throw new Error("Submission failed");

            setSuccess(true);
            setFile(null);
            setComments('');

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to submit assignment.");
        } finally {
            setUploading(false);
        }
    };

    if (!assignment) {
        return <div className="p-8 text-center text-slate-500 italic">No assignment for this lesson.</div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-2xl mx-auto my-8">
            <h3 className="font-heading text-2xl font-bold text-deep-navy mb-2">{assignment.title}</h3>
            <p className="text-slate-600 mb-6">{assignment.description}</p>

            {assignment.due_date && (
                <div className="mb-6 text-sm text-red-500 font-medium">
                    Due Date: {new Date(assignment.due_date).toLocaleDateString()}
                </div>
            )}

            {success ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Assignment submitted successfully!
                    <Button variant="ghost" size="sm" onClick={() => setSuccess(false)} className="ml-auto text-green-700 hover:text-green-800">
                        Submit another
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-brand-blue transition-colors">
                        <input
                            type="file"
                            id="assignment-file"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <label htmlFor="assignment-file" className="cursor-pointer">
                            <div className="mx-auto w-12 h-12 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            </div>
                            <span className="block text-sm font-medium text-slate-900">
                                {file ? file.name : "Click to upload assignment file"}
                            </span>
                            <span className="block text-xs text-slate-500 mt-1">
                                PDF, DOCX, ZIP up to 10MB
                            </span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Comments (Optional)</label>
                        <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                            rows={3}
                            placeholder="Add any notes for the instructor..."
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        disabled={!file || uploading}
                        className="w-full"
                    >
                        {uploading ? 'Uploading...' : 'Submit Assignment'}
                    </Button>
                </form>
            )}
        </div>
    );
}
