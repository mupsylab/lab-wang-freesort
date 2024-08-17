import { createRouter, createWebHashHistory } from 'vue-router'

import experDefault from "../views/exper/default.vue";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "jspsych",
      component: experDefault,
      alias: "/exper"
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/error/index.vue"),
    }
  ]
});

export default router;
