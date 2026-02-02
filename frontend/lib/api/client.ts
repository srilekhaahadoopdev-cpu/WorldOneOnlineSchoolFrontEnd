import axios from 'axios';

// Create an instance of axios with default configuration
export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1',
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
