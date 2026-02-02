'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
    id: string;
    option_text: string;
    order_index: number;
}

interface Question {
    id: string;
    question_text: string;
    question_type: string;
    points: number;
    options: Option[];
}

interface Quiz {
    id: string;
    title: string;
    description: string;
    questions: Question[];
}

interface Attempt {
    id: string;
    score: number;
    max_score: number;
    completed_at: string;
}

interface QuizRunnerProps {
    lessonId: string;
    onComplete?: (score: number, maxScore: number) => void;
}

export default function QuizRunner({ lessonId, onComplete }: QuizRunnerProps) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({}); // question_id -> option_id
    const [result, setResult] = useState<{ score: number; max_score: number; percentage: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Previous Attempts State
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [isRetaking, setIsRetaking] = useState(false);
    const [bestScore, setBestScore] = useState<Attempt | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                // 1. Fetch Quiz
                const res = await fetch(`${API_URL}/lessons/${lessonId}/quiz`);
                if (res.status === 404 || res.status === 500) {
                    if (isMounted) {
                        setQuiz(null);
                        setLoading(false);
                    }
                    return;
                }
                const quizData = await res.json();

                if (isMounted) setQuiz(quizData);

                // 2. Fetch Attempts (if user is logged in)
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user && quizData) {
                    const attRes = await fetch(`${API_URL}/quizzes/${quizData.id}/attempts/${user.id}`);
                    if (attRes.ok) {
                        const attData: Attempt[] = await attRes.json();
                        if (isMounted) {
                            setAttempts(attData);
                            // Calculate best score
                            if (attData.length > 0) {
                                const best = attData.reduce((prev, current) =>
                                    (current.score / current.max_score) > (prev.score / prev.max_score) ? current : prev
                                );
                                setBestScore(best);
                                setIsRetaking(false); // Show summary view initially if attempts exist
                            } else {
                                setIsRetaking(true); // First time taking
                            }
                        }
                    }
                }

            } catch (err) {
                console.error("Failed to load quiz data", err);
                if (isMounted) setError("Failed to load quiz content.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (lessonId) fetchData();

        return () => { isMounted = false; };
    }, [lessonId, API_URL]);

    const handleOptionSelect = (questionId: string, optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleSubmit = async () => {
        if (!quiz) return;

        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError("You must be logged in to submit.");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                quiz_id: quiz.id,
                user_id: user.id,
                answers: answers
            };

            const res = await fetch(`${API_URL}/assessments/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Submission failed");

            const resultData = await res.json();
            setResult(resultData);

            // Refresh attempts list essentially by adding this one (optimistic)
            const newAttempt: Attempt = {
                id: 'temp-' + Date.now(),
                score: resultData.score,
                max_score: resultData.max_score,
                completed_at: new Date().toISOString()
            };
            setAttempts(prev => [newAttempt, ...prev]);

            // Update best score if this is better
            const currentPercentage = resultData.percentage;
            const bestPercentage = bestScore ? (bestScore.score / bestScore.max_score * 100) : 0;
            if (currentPercentage >= bestPercentage) {
                setBestScore(newAttempt);
            }

            if (onComplete) {
                onComplete(resultData.score, resultData.max_score);
            }

        } catch (err) {
            console.error(err);
            setError("Failed to submit quiz.");
        } finally {
            setLoading(false);
        }
    };

    const startRetake = () => {
        setIsRetaking(true);
        setResult(null);
        setAnswers({});
        setCurrentQuestionIndex(0);
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <div className="h-8 w-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return <div className="p-6 bg-red-50 text-red-600 rounded-lg">{error}</div>;
    }

    if (!quiz) {
        return <div className="p-8 text-center text-slate-500 italic">No quiz available for this lesson.</div>;
    }

    // --- VIEW: SUMMARY / PREVIOUS ATTEMPTS ---
    if (!isRetaking && attempts.length > 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 max-w-2xl mx-auto my-8"
            >
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">📊</div>
                    <h3 className="font-heading text-2xl font-bold text-deep-navy">Quiz History</h3>
                    <p className="text-slate-500">You have taken this quiz {attempts.length} time{attempts.length !== 1 ? 's' : ''}.</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 mb-8 flex justify-between items-center border border-slate-200">
                    <div>
                        <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Best Score</div>
                        <div className="text-3xl font-bold text-brand-blue">
                            {bestScore ? Math.round(bestScore.score / bestScore.max_score * 100) : 0}%
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Last Attempt</div>
                        <div className="text-xl font-semibold text-slate-700">
                            {Math.round(attempts[0].score / attempts[0].max_score * 100)}%
                        </div>
                        <div className="text-xs text-slate-400">
                            {new Date(attempts[0].completed_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Button onClick={startRetake} className="w-full py-6 text-lg shadow-lg shadow-blue-100" variant="primary">
                        Start Retake
                    </Button>
                </div>
            </motion.div>
        );
    }

    // --- VIEW: RESULTS (Just Finished) ---
    if (result) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center max-w-2xl mx-auto my-8"
            >
                <div className="mb-6">
                    <span className="text-6xl text-brand-blue">🏆</span>
                </div>
                <h3 className="font-heading text-2xl font-bold text-deep-navy mb-4">Quiz Completed!</h3>
                <div className="text-lg text-slate-600 mb-8">
                    You scored <span className="font-bold text-brand-blue">{result.percentage.toFixed(0)}%</span>
                    ({result.score} / {result.max_score} points)
                </div>

                <div className="w-full bg-slate-100 rounded-full h-4 mb-8 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${result.percentage >= 70 ? 'bg-green-500' : 'bg-brand-gold'}`}
                    />
                </div>

                <div className="flex gap-4 justify-center">
                    <Button onClick={() => setIsRetaking(false)} variant="outline">View History</Button>
                    <Button onClick={startRetake} variant="primary">Retake Immediately</Button>
                </div>
            </motion.div>
        );
    }

    // --- VIEW: QUIZ ACTIVE ---
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    const canSubmit = Object.keys(answers).length === quiz.questions.length;

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden max-w-2xl mx-auto my-8">
            <div className="bg-deep-navy text-white p-6 flex justify-between items-center">
                <div>
                    <h3 className="font-heading font-bold text-xl">{quiz.title}</h3>
                    {attempts.length > 0 && <span className="text-xs opacity-70 bg-white/20 px-2 py-0.5 rounded-full inline-block mt-1">Retake Mode</span>}
                </div>
                <span className="text-sm opacity-80">
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </span>
            </div>

            <div className="p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h4 className="text-lg font-medium text-slate-800 mb-6 leading-relaxed">
                            {currentQuestion.question_text}
                        </h4>

                        <div className="space-y-3">
                            {currentQuestion.options.map((option) => (
                                <div
                                    key={option.id}
                                    onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center ${answers[currentQuestion.id] === option.id
                                        ? 'border-brand-blue bg-blue-50/50 shadow-md'
                                        : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${answers[currentQuestion.id] === option.id
                                        ? 'border-brand-blue'
                                        : 'border-slate-300'
                                        }`}>
                                        {answers[currentQuestion.id] === option.id && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-brand-blue" />
                                        )}
                                    </div>
                                    <span className={`text-slate-700 ${answers[currentQuestion.id] === option.id ? 'font-medium text-deep-navy' : ''}`}>
                                        {option.option_text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-100">
                    <Button
                        variant="ghost"
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                    >
                        Previous
                    </Button>

                    {isLastQuestion ? (
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className="bg-brand-gold text-deep-navy hover:bg-yellow-500 font-bold"
                        >
                            {loading ? 'Submitting...' : 'Submit Quiz'}
                        </Button>
                    ) : (
                        <Button
                            variant="secondary"
                            onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                        >
                            Next Question
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
