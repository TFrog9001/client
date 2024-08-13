import { createWebHistory, createRouter } from "vue-router";
const routes = [
    {
        path: "/:pathMatch(.*)*",
        name: "notfound",
        component: () => import("@/views/NotFound.vue"),
    },
    {
        path: "/login",
        name: "login",
        component: () => import("@/views/Login.vue"),
        // beforeEnter: (to, from, next) => {},
        // beforeEnter: (to, from, next) => {
        //     const authStore = useAuthStore();
        //     if (authStore.isAdminLoggedIn) {
        //         next("/home");
        //     } else {
        //         next();
        //     }
        // },
    }
];
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;
