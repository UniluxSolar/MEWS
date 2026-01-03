import axios from 'axios';

// Ensure the base URL includes /api
// Ensure the base URL includes /api
let baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
    // Dynamic fallback: use current hostname with port 8080
    // This allows it to work on localhost and GCP IP automatically
    baseURL = `http://${window.location.hostname}:8080/api`;
} else if (!baseURL.endsWith('/api')) {
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
