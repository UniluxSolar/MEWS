import axios from 'axios';

// Ensure the base URL includes /api
let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (baseURL && !baseURL.endsWith('/api')) {
    baseURL += '/api';
}

const API = axios.create({
    baseURL: baseURL,
});

// Add a request interceptor to include the token
API.interceptors.request.use((req) => {
    if (localStorage.getItem('adminInfo')) {
        const { token } = JSON.parse(localStorage.getItem('adminInfo'));
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;
