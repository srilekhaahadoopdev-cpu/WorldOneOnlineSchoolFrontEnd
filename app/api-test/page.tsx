'use client';

import { useEffect, useState } from 'react';

export default function ApiTestPage() {
    const [results, setResults] = useState<any>({});

    useEffect(() => {
        const runTests = async () => {
            const testResults: any = {
                envVar: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
                hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
                isLocalhost: typeof window !== 'undefined' ?
                    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') :
                    'SSR',
            };

            // Test 1: Health check with relative path
            try {
                const res1 = await fetch('/api/v1/health');
                testResults.relativePathTest = {
                    status: res1.status,
                    ok: res1.ok,
                    body: res1.ok ? await res1.json() : await res1.text()
                };
            } catch (e: any) {
                testResults.relativePathTest = { error: e.message };
            }

            // Test 2: Health check with env var (if set)
            if (process.env.NEXT_PUBLIC_API_URL) {
                try {
                    const res2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
                    testResults.envVarTest = {
                        status: res2.status,
                        ok: res2.ok,
                        body: res2.ok ? await res2.json() : await res2.text()
                    };
                } catch (e: any) {
                    testResults.envVarTest = { error: e.message };
                }
            }

            setResults(testResults);
        };

        runTests();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">API Connection Diagnostic</h1>

                <div className="bg-white rounded-lg shadow p-6 mb-4">
                    <h2 className="text-xl font-bold mb-4">Environment Info</h2>
                    <pre className="bg-slate-100 p-4 rounded overflow-auto text-sm">
                        {JSON.stringify(results, null, 2)}
                    </pre>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="font-bold">Instructions:</p>
                    <ol className="list-decimal ml-5 mt-2 space-y-1">
                        <li>Check if <code className="bg-yellow-100 px-1">relativePathTest</code> shows <code className="bg-yellow-100 px-1">ok: true</code></li>
                        <li>If envVar contains "localhost" or "127.0.0.1", that's the problem!</li>
                        <li>Share this output with the developer</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
