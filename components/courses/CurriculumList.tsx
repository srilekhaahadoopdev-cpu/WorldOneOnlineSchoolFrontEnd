'use client';

import Link from 'next/link';

interface CurriculumListProps {
    modules: any[];
    visibleModules: any[];
    showFullCurriculum: boolean;
    isAdmin: boolean;
    isEnrolled: boolean;
    slug: string;
}

export default function CurriculumList({
    modules,
    visibleModules,
    showFullCurriculum,
    isAdmin,
    isEnrolled,
    slug
}: CurriculumListProps) {

    return (
        <div className="space-y-4">
            {(visibleModules && visibleModules.length > 0) ? (
                <>
                    {visibleModules.map((mod) => (
                        <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 p-4 font-medium text-deep-navy">
                                {mod.title}
                            </div>
                            <div className="bg-white divide-y divide-slate-50">
                                {mod.lessons.map((lesson: any) => (
                                    <Link
                                        key={lesson.id}
                                        href={((isAdmin || isEnrolled) || lesson.is_free_preview) ? `/courses/${slug}/learn?lesson=${lesson.id}` : '#'}
                                        className={`block text-inherit no-underline ${!((isAdmin || isEnrolled) || lesson.is_free_preview) ? 'cursor-not-allowed opacity-60' : ''}`}
                                        onClick={(e) => {
                                            if (!((isAdmin || isEnrolled) || lesson.is_free_preview)) {
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        <div className="p-3 pl-6 flex justify-between items-center text-sm text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-2 group-hover:text-brand-blue">
                                                <span className="opacity-70">{
                                                    lesson.lesson_type === 'video' ? '🎥' :
                                                        lesson.lesson_type === 'quiz' ? '❓' :
                                                            lesson.lesson_type === 'pdf' ? '📄' : '📄'
                                                }</span>
                                                <span className="truncate">{lesson.title}</span>
                                                {!((isAdmin || isEnrolled) || lesson.is_free_preview) && (
                                                    <span className="text-xs text-slate-400 ml-2">🔒</span>
                                                )}
                                            </div>
                                            {lesson.is_free_preview && (
                                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Preview</span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                                {mod.lessons.length === 0 && (
                                    <div className="p-3 pl-6 text-sm text-slate-400 italic">No lessons yet</div>
                                )}
                            </div>
                        </div>
                    ))}
                    {!showFullCurriculum && (
                        <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                            <p className="text-slate-600 font-medium mb-2">
                                + {Math.max(0, modules.length - 2)} more modules available
                            </p>
                            <p className="text-sm text-slate-500 mb-4">
                                Enroll in the course to unlock the full curriculum and all lessons.
                            </p>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-slate-500 italic">Curriculum coming soon.</p>
            )}
        </div>
    );
}
