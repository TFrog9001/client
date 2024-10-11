import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import NotFound from '../views/NotFound.vue';
import Fields from '../views/Fileds/Fields.vue';  
import FieldDetail from '../views/Fileds/FieldDetail.vue'; 
import Booking from '../views/Booking/Booking.vue'; 
import BookingDetail from '../views/Booking/BookingDetail.vue';  
import UserProfile from '../views/Users/UserProfile.vue';
import Register from '../views/Register.vue';

const routes = [
    { path: '/', redirect: { name: 'Home' } },
    { path: '/home', name: 'Home', component: Home },
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'Register', component: Register },
    { path: '/fields', name: 'Fields', component: Fields },
    { path: '/fields/:id', name: 'FieldDetail', component: FieldDetail },
    { path: '/booking', name: 'Booking', component: Booking, meta: { requiresAuth: true } },
    { path: '/booking/:id', name: 'BookingDetail', component: BookingDetail, meta: { requiresAuth: true } },
    { path: '/account', name: 'UserProfile', component: UserProfile, meta: { requiresAuth: true } },
    { path: '/user-booking', name: 'UserBooking', component: UserProfile, meta: { requiresAuth: true } },
    { path: '/:catchAll(.*)', name: 'NotFound', component: NotFound },
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
    next();
});

export default router;
