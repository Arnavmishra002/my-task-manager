import axios from 'axios';

// Hardcoded to ensure public access (Render 'host' var returns internal name)
const baseURL = 'https://task-manager-server-ilev.onrender.com';
// let baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000';
// if (!baseURL.startsWith('http')) {
//    baseURL = `https://${baseURL}`;
// }

const api = axios.create({
    baseURL: `${baseURL}/api/v1`,
    // withCredentials: true, // Not needed for Bearer token, can cause CORS issues if origin is wildcard-like
});

console.log('🔗 API Base URL Configured as:', `${baseURL}/api/v1`);

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // optional: handle globally, e.g. 401 redirect
        return Promise.reject(error);
    }
);

export default api;
