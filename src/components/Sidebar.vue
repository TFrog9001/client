<template>
    <v-navigation-drawer v-model="drawer" :rail="rail" permanent @click="rail = false">
        <v-list-item prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg" title="John Leider" nav>
            <template v-slot:append>
                <v-btn icon="mdi-chevron-left" variant="text" @click.stop="rail = !rail"></v-btn>
            </template>
        </v-list-item>

        <v-divider></v-divider>

        <v-list density="compact" nav>
            <!-- Lặp qua danh sách các item -->
            <v-list-item v-for="(item, index) in items" :key="index" :prepend-icon="item.icon" :title="item.title"
                :value="item.value" :to="item.to"></v-list-item>
        </v-list>
        <!-- <v-list density="compact" nav :items="items"></v-list> -->

        <template v-slot:append>
            <v-divider></v-divider>
            <div class="pa-3">
                <v-btn class="" block variant="outlined" @click="logout">
                    <v-icon color="error" left>mdi-power</v-icon>
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

<script>
import { ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

export default {
    setup() {
        const { smAndDown } = useDisplay();

        const drawer = ref(true);
        const rail = ref(false);

        watch(smAndDown, (newValue) => {
            drawer.value = !newValue;
            rail.value = false;
        });

        const items = ref([
            { icon: 'mdi-home-city', title: 'Home', value: 'home', to: 'admin' },
            { icon: 'mdi-account', title: 'My Account', value: 'account', to: 'profile' },
            { icon: 'mdi-account-group-outline', title: 'Users', value: 'users', to: 'users' },
        ]);

        return {
            drawer,
            rail,
            items,
        };
    }
}
</script>

<style scoped>

</style>
