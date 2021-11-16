import { createRouter, createWebHashHistory } from "vue-router";
import Home from '../views/Home.vue'
import Index from '../views/Index.vue'
import Login from '../views/Login.vue'
const routerHistory = createWebHashHistory()
const router = createRouter({
    history: routerHistory,
    routes: [
        {
            path: '/', component: Home,
            redirect: '/login'
        },
        {
            path: '/login', component: Login,
        }
    ]
})
export default router