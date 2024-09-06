import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Login from '../views/Login.vue';
import Admin from '../views/Admin.vue';
import NotFound from '../views/NotFound.vue';
import UserList from '../views/Users/UserList.vue';
import Fields from '../views/Fileds/Fields.vue';

const routes = [
    {
        path: '/',
        redirect: () => {
            const authStore = useAuthStore();
            return authStore.isAuthenticated ? { name: 'Admin' } : { name: 'Login' };
        },
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
    },
    {
        path: '/dashboard',
        name: 'Admin',
        component: Admin,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/users',
        name: 'Users',
        component: UserList,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/fields',
        name: 'Fields',
        component: Fields,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/test',
        name: 'Test',
        component: NotFound,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/:catchAll(.*)',
        name: 'NotFound',
        component: NotFound,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return next({ name: 'Login' });
    }
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
        alert('Bạn không có quyền truy cập vào trang này.');
        return next({ name: 'Login' });
    }
    next();
});

export default router;
