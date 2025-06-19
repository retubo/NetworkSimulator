import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import NetworkView from '@/views/NetworkView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/network', component: NetworkView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
