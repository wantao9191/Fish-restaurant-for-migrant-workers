import { createRouter, createWebHistory } from "vue-router";
import Home from '../views/Home.vue'
import Index from '../views/Index.vue'
const routerHistory = createWebHistory()
const router = createRouter({
    history: routerHistory,
    routes: [
        { path: '/', component: Home },
        // {
        //     path: '/index', component:Index,
        // }
    ]
})
export default router