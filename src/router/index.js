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
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/acervototal',
      name: 'acervototal',
      component: () => import('../views/AcervoView.vue'),
    },
    {
      path: '/colecionador',
      name: 'colecionador',
      component: () => import('../views/CollectorPage.vue'),
    },
    {
      path: '/artefato',
      name: 'artefato',
      component: () => import('../views/ArtefatoView.vue'),
    },
    {
      path: '/movimentacao',
      name: 'movimentacao',
      component: () => import('../views/MovementManager.vue'),
    },
    {
      path: '/sidefilter',
      name: 'sidefilter',
      component: () => import('../components/SideFilter.vue'),
      props: { options: { colecao: [], materia: [], subtipo: [] } },
    },
    {
      path: '/acervocard',
      name: 'acervocard',
      component: () => import('../components/AcervoCard.vue'),
      props: { item: { id: 999, titulo: 'Teste' } },
    },
    {
      path: '/navbar',
      name: 'navbar',
      component: () => import('../components/NavBar.vue'),
    },
    {
      path: '/item/:id',
      name: 'item-detail',
      component: () => import('../views/ItemDetailView.vue'),
      props: true,
    },
    {
      path: '/visitavirtual',
      name: 'visita-virtual',
      component: () => import('../views/VisitaVirtualView.vue'),
    },
  ],

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

export default router