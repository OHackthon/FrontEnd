import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/artefato',
      name: 'artefato',
      component: () => import('../views/ArtefatoView.vue'),
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
    {
      path: '/acervototal',
      name: 'acervototal',
      component: () => import('../views/AcervoView.vue'),
    },
    {
      path: '/sidefilter',
      name: 'sidefilter',
      component: () => import('../components/SideFilter.vue'),
    },
    {
      path: '/acervocard',
      name: 'acervocard',
      component: () => import('../components/AcervoCard.vue'),
    },
    {
      path: '/navbar',
      name: 'navbar',
      component: () => import('../components/NavBar.vue'),
    }
  ],

scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  }
})

export default router
