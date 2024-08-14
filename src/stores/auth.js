import { defineStore } from 'pinia';
import api from '../axios/api';
import Cookies from 'js-cookie';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) ||null,
        token: Cookies.get('token') || null,
        refreshToken: Cookies.get('refresh_token') || null, 
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => state.user?.role_id === 1,
    },
    actions: {
        async login(credentials) {
            try {
                const response = await api.post('/auth/login', credentials);
                this.token = response.data.token;
                this.refreshToken = response.data.refresh_token;
                
                Cookies.set('token', this.token);
                Cookies.set('refresh_token', this.refreshToken);

                await this.fetchUser();
            } catch (error) {
                throw new Error('Đăng nhập thất bại');
            }
        },
        async fetchUser() {
            try {
                const response = await api.get('/auth/me');
                this.user = response.data.user;
                localStorage.setItem('user', JSON.stringify(this.user));
            } catch (error) {
                this.logout();
            }
        },
        async refreshTokenForUser() {
            try {
                const response = await api.post('/auth/refresh', { refresh_Token: this.refreshToken });
                this.token = response.data.token;
                this.refreshToken = response.data.refresh_token; 
                Cookies.set('token', this.token);
                Cookies.set('refresh_token', this.refreshToken);
            } catch (error) {
                this.logout();
                throw new Error('Làm mới token thất bại');
            }
        },
        async fetchWithAuth(request) {
            try {
                return await request();
            } catch (error) {
                if (error.response && error.response.status === 401) { 
                    await this.refreshTokenForUser();
                    return await request();  
                }
                throw error;  
            }
        },
        async logout() {
            try {
                await api.post('/auth/logout');
            } catch (error) {
                console.error('Lỗi khi đăng xuất:', error);
            } finally {
                this.user = null;
                this.token = null;
                this.refreshToken = null;
                Cookies.remove('token');
                Cookies.remove('refresh_token');
            }
        },
    },
});
