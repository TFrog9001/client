import { defineStore } from 'pinia';
import api from '../axios/api';
import Cookies from 'js-cookie';
import { showNotification } from '../utils/notification';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
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
                if (error.response && (error.response.data.error || error.response.data.errors)) {
                    throw error;
                }
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
                // const response = await api.post('/auth/refresh', { refresh_Token: this.refreshToken });
                const response = await api.post('/auth/refresh', null, { // null body
                    headers: {
                        'Authorization': `Bearer ${this.refreshToken}`  // Truyền refresh_token trong header
                    }
                });
                this.token = response.data.token;
                this.refreshToken = response.data.refresh_token; 
                Cookies.set('token', this.token);
                Cookies.set('refresh_token', this.refreshToken);
            } catch (error) {
                showNotification({  // Thêm thông báo lỗi
                    title: 'Lỗi làm mới',
                    message: 'Không thể làm mới token. Bạn sẽ được đăng xuất.',
                    type: 'error',
                });
                this.logout();
                throw new Error('Làm mới token thất bại');
            }
        },
        async logout() {
            try {
                const response = await api.post('/auth/logout');
                showNotification({
                    title: 'Thành công',
                    message: response.data.message || 'Đăng xuất thành công',
                    type: 'success',
                });
                this.user = null;
                this.token = null;
                this.refreshToken = null;
                Cookies.remove('token');
                Cookies.remove('refresh_token');
                localStorage.removeItem('user');
            } catch (error) {
                // console.error('Lỗi khi đăng xuất:', error);
                // showNotification({
                //     title: 'Thất bại',
                //     message: 'Đăng xuất thất bại',
                //     type: 'error',
                // });
            } finally {
                // this.user = null;
                // this.token = null;
                // this.refreshToken = null;
                // Cookies.remove('token');
                // Cookies.remove('refresh_token');
                // localStorage.removeItem('user');
            }
        },
    },
});
