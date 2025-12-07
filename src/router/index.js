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
      path: '/item/:id',
      name: 'detalhe-item',
      component: () => import('../views/ItemDetailView.vue'),
      props: true,
    },
    {
      path: '/visita-virtual',
      name: 'visita-virtual',
      component: () => import('../views/VisitaVirtualView.vue'),
    },
    {
      path: '/dashboard',
      component: () => import('../layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/DashboardHome.vue'),
        },
        {
          path: 'gestao',
          name: 'gestao',
          component: () => import('../views/CollectorPage.vue'),
        },
        {
          path: 'categorias',
          name: 'categorias',
          component: () => import('../views/CategoriaManagerView.vue'),
        },
        {
          path: 'artefatos',
          name: 'artefatos',
          component: () => import('../views/ArtefatoView.vue'),
        },
        {
          path: 'reservas',
          name: 'reservas',
          component: () => import('../views/MovementManager.vue'),
        },
        {
          path: 'usuarios',
          name: 'usuarios',
          component: () => import('../views/UserManagerView.vue'),
        },
      ],
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('access_token')
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})
export default router