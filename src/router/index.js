import { createRouter, createWebHashHistory } from "vue-router";

import View1 from "../views/link1.vue";

const routes = [{
    path: "/",
    component: View1
}];

const router = createRouter({
    history: createWebHashHistory(),
    routes
})
export default router