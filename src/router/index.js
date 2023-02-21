import { createRouter, createWebHashHistory } from "vue-router";

const View1 = () => import("../views/link1.vue");
const routes = [{
    path: "/",
    component: View1
}];

const router = createRouter({
    history: createWebHashHistory(),
    routes
})
export default router