import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function Pricing() {
    return (
        <section className="py-20 bg-slate-50 border-t border-slate-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-deep-navy mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-slate-600 text-lg">
                        Choose the plan that fits your learning goals. No hidden fees.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Single Course Card */}
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 relative">
                        <h3 className="font-heading text-2xl font-bold text-deep-navy mb-2">Single Course</h3>
                        <p className="text-slate-500 mb-6">Perfect for focused learning in specific subjects.</p>
                        <div className="flex items-baseline mb-8">
                            <span className="text-4xl font-bold text-deep-navy">$149</span>
                            <span className="text-slate-500 ml-2">/ course</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-slate-600">Full access to course materials</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-slate-600">Certificate of Completion</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-slate-600">Lifetime access</span>
                            </li>
                        </ul>

                        <Link href="/courses">
                            <Button variant="outline" className="w-full">Choose Courses</Button>
                        </Link>
                    </div>

                    {/* Subscription Card */}
                    <div className="bg-deep-navy rounded-2xl p-8 border border-slate-800 shadow-xl relative overflow-hidden transform md:-translate-y-4">
                        <div className="absolute top-0 right-0 bg-gradient-to-bl from-brand-blue to-transparent w-24 h-24 opacity-20 rounded-bl-full"></div>

                        <div className="absolute top-4 right-4 bg-brand-blue text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                            Best Value
                        </div>

                        <h3 className="font-heading text-2xl font-bold text-white mb-2">All Access Pass</h3>
                        <p className="text-slate-400 mb-6">Unlimited learning for ambitous students.</p>
                        <div className="flex items-baseline mb-8">
                            <span className="text-4xl font-bold text-white">$99</span>
                            <span className="text-slate-400 ml-2">/ month</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-brand-blue mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-slate-300">Access to ALL 50+ courses</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-brand-blue mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-slate-300">Live Q&A with instructors</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-brand-blue mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-slate-300">Priority support</span>
                            </li>
                        </ul>

                        <Link href="/register">
                            <Button variant="primary" className="w-full shadow-brand-blue/20">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
