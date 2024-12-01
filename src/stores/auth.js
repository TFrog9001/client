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
                return Promise.resolve();
            } catch (error) {
                if (error.response && (error.response.data.error || error.response.data.errors)) {
                    throw error;
                }
                throw new Error('Đăng nhập thất bại');
            }
        },
        async register(credentials) {
            try {
                const response = await api.post('/auth/register', credentials);
                this.token = response.data.token;
                this.refreshToken = response.data.refresh_token;
                
                Cookies.set('token', this.token);
                Cookies.set('refresh_token', this.refreshToken);

                await this.fetchUser();
                return Promise.resolve();
            } catch (error) {
                if (error.response && (error.response.data.error || error.response.data.errors)) {
                    throw error;
                }
                throw new Error('Đăng nhập thất bại');
            }
        },
        async googleLogin() {
            try {
                // Gọi đến API Google OAuth của Laravel để lấy token
                const response = await api.get('/auth/google/callback');
                this.token = response.data.token;
                this.refreshToken = response.data.refresh_token;

                // Lưu trữ token vào Cookies
                Cookies.set('token', this.token);
                Cookies.set('refresh_token', this.refreshToken);

                // Gọi hàm fetchUser để lấy thông tin người dùng
                await this.fetchUser();

                // Thông báo đăng nhập thành công
                showNotification({
                    title: 'Thành công',
                    message: 'Đăng nhập Google thành công',
                    type: 'success',
                });
            } catch (error) {
                showNotification({
                    title: 'Lỗi',
                    message: 'Đăng nhập bằng Google thất bại',
                    type: 'error',
                });
                throw new Error('Đăng nhập bằng Google thất bại');
            }
        },
        async fetchUser() {
            try {
                const response = await api.get('/auth/me');
                this.user = response.data.user;
                Cookies.set('user_id', this.user.id);
                localStorage.setItem('user', JSON.stringify(this.user));
            } catch (error) {
                this.logout();
            }
        },
        async refreshTokenForUser() {
            try {
                // const response = await api.post('/auth/refresh', { refresh_Token: this.refreshToken });
                const response = await api.post('/auth/refresh', null, { 
                    headers: {
                        'Authorization': `Bearer ${this.refreshToken}`  
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
