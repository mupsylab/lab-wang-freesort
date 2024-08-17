import '@/assets/css/reset.css'
import '@/assets/css/color.css'
import '@/assets/css/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useColorScheme } from './store/colorScheme';

import App from './App.vue'
import router from './router/index'

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.mount('#app');

const cs = useColorScheme();
cs.switch("dark");
document.body.classList.add(cs.currScheme);