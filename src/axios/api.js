import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { showNotification } from '../utils/notification';  // Thêm dòng này

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
});

api.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    if (config.url.includes('/auth/refresh')) {
        config.headers.Authorization = `Bearer ${authStore.refreshToken}`;
    } else if (authStore.isAuthenticated) {
        config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use((response) => response, async (error) => {
    const authStore = useAuthStore();
    if (error.response.status === 401 && authStore.isAuthenticated) {
        try {
            await authStore.refreshTokenForUser(); 
            error.config.headers.Authorization = `Bearer ${authStore.token}`;
            return axios(error.config);
        } catch (refreshError) {
            authStore.logout();
            return Promise.reject(refreshError);
        }
    }
    return Promise.reject(error);
});

export default api;
