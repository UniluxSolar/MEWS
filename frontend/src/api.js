import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080/api',
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
