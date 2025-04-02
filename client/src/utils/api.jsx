import axios from 'axios';
import Cookies from 'js-cookie'

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': "application/json"
    },
    withCredentials: true
});

api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            delete config.headers.Authorization;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry && Cookies.get('refreshToken')) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh token
                const response = await api.post('/auth/refresh', {
                    refreshToken: Cookies.get('refreshToken')
                });

                const { token } = response.data;

                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, clear all auth data and redirect to login
                Cookies.remove('token');
                Cookies.remove('refreshToken');
                Cookies.remove('user');
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }

        // Handle blocked user or other auth errors
        if (error.response?.data?.action === 'LOGOUT') {
            Cookies.remove('token');
            Cookies.remove('refreshToken');
            Cookies.remove('user');
            window.location.href = '/';
        }

        return Promise.reject(error);
    }
);

export const authService = {
    register: async(formData) => {
        try {
            const response = await api.post('/auth/signup', formData)
            return response.data;
        } catch (error) {
            console.error('signup failed', error)
            throw error;
        }
    },
    login: async(credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    logout: async() => {
        const response = await api.post('/auth/logout');
        return response.data;
    }
}

export const rrwebService = {
    getRecordings: async() => {
        const response = await api.get('/recording/get');
        return response.data
    },
    getRecordingById: async(id) => {
        const response = await api.get(`/recording/get/${id}`);
        console.log('res',response.data);
        return response.data
    }
}