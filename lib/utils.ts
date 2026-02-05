import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getBaseUrl() {
    if (typeof window !== 'undefined') {
        return window.location.origin + '/api/v1';
    }
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api/v1`;
    return 'http://127.0.0.1:8002/api/v1';
}
