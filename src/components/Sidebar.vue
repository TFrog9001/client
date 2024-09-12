<template>
    <v-navigation-drawer class="bg-teal-darken-2" v-model="drawer" :rail="rail" permanent @click="rail = false">
        <v-list-item class="mb-2"
            prepend-avatar="https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png" nav>
            <v-list-item-title class="text-h6">{{ authStoreMenu.user?.name || 'User' }}</v-list-item-title>
            <!-- <v-list-item-subtitle v-if="!rail && authStoreMenu.user">{{ authStoreMenu.user.email
                }}</v-list-item-subtitle> -->
            <template v-slot:append>
                <v-btn icon="mdi-chevron-left" variant="text" @click.stop="rail = !rail"></v-btn>
            </template>
        </v-list-item>

        <v-divider></v-divider>

        <v-list density="compact" nav>
            <v-list-item v-for="(item, index) in items" :key="index" :prepend-icon="item.icon" :title="item.title"
                :value="item.value" :to="item.to"></v-list-item>
        </v-list>

        <template v-slot:append>
            <v-divider></v-divider>
            <div class="pa-3">
                <v-btn class="bg-red" block variant="tonal" @click="handleLogout">
                    <v-icon color="" left>mdi-power</v-icon>
                    <span v-if="!rail">Logout</span>
                </v-btn>
            </div>
        </template>
    </v-navigation-drawer>
    <v-app-bar>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-app-bar-title>Application</v-app-bar-title>
        <template v-if="$vuetify.display.mdAndUp">
            <v-btn icon="mdi-magnify" variant="text"></v-btn>
            <v-btn icon="mdi-filter" variant="text"></v-btn>
        </template>
    </v-app-bar>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStoreMenu = useAuthStore();
const router = useRouter();

const handleLogout = () => {
    authStoreMenu.logout();
    router.push({ name: 'Login' });
};

const { smAndDown } = useDisplay();

const drawer = ref(true);
const rail = ref(false);

watch(smAndDown, (newValue) => {
    drawer.value = !newValue;
    rail.value = false;
});

const items = ref([
    { icon: 'mdi-home-city', title: 'Home', value: 'home', to: { name: 'Admin' } },
    { icon: 'mdi-account-group-outline', title: 'Users', value: 'users', to: { name: 'Users' } },
    { icon: 'mdi-soccer-field', title: 'Fields', value: 'fields', to: { name: 'Fields' } },
    { icon: 'mdi-calendar-multiple-check', title: 'Booking', value: 'booking', to: { name: 'Booking' } },
]);
</script>

<style scoped></style>
