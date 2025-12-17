import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000'}/api/v1`,
    // withCredentials: true, // Not needed for Bearer token, can cause CORS issues if origin is wildcard-like
});

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
