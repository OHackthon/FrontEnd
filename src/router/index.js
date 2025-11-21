import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    // Rotas adicionais para o menu e cards (simulação)
   
   
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'), // Mock view
    },
  
     
  
  ],
})

export default router