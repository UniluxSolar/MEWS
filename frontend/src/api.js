import axios from 'axios';

// Ensure the base URL includes /api
// Ensure the base URL includes /api
let baseURL = import.meta.env.VITE_API_URL || '/api';

// Fix for Mixed Content: If running on HTTPS but API URL is HTTP, force use of relative path
// This allows Nginx to proxy the request correctly instead of browser blocking it
if (typeof window !== 'undefined' && window.location.protocol === 'https:' && baseURL.startsWith('http:')) {
    console.warn('Mixed Content detected: VITE_API_URL is HTTP but page is HTTPS. Falling back to relative path /api');
    baseURL = '/api';
}

if (baseURL && !baseURL.endsWith('/api')) {
    baseURL += '/api';
}

const API = axios.create({
    baseURL: baseURL,
    withCredentials: true, // Send Cookies
});

// Add a request interceptor to include the token
API.interceptors.request.use((req) => {
    if (localStorage.getItem('adminInfo')) {
        const { token } = JSON.parse(localStorage.getItem('adminInfo'));
        // Only add header if token is actually present and valid
        if (token) {
            req.headers.Authorization = `Bearer ${token}`;
        }
    }
    return req;
});

export default API;
