import { createApp } from 'vue';
import { createPinia } from 'pinia';

// Remove Element Plus imports
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

// Add Vuetify imports
import 'vuetify/styles'; // Import Vuetify styles
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import App from './App.vue';
import router from './router';

// Create Vue app
const app = createApp(App);

// Use Pinia and Router
app.use(createPinia());
app.use(router);

// Create Vuetify instance and use it
const vuetify = createVuetify({
    components,
    directives,
});
app.use(ElementPlus);
app.use(vuetify); // Sử dụng Vuetify

// Mount the app
app.mount('#app');
