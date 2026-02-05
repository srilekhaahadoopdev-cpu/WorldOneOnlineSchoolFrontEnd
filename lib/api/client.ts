import axios from 'axios';

// Create an instance of axios with default configuration
const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (typeof window !== 'undefined') return '/api/v1'; // Client-side relative URL
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api/v1`;
    return 'http://127.0.0.1:8002/api/v1';
};

export const apiClient = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the auth token if available
apiClient.interceptors.request.use(
    async (config) => {
        // We will implement token logic here in Phase 2 (Auth)
        // For now, it just passes through
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
