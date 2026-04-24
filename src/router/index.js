import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue')
  },
  {
    path: '/',
    name: 'POS',
    component: () => import('../pages/POS.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/inventario',
    name: 'Inventario',
    component: () => import('../pages/Inventario.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: () => import('../pages/Clientes.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/caja',
    name: 'Caja',
    component: () => import('../pages/Caja.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../pages/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: () => import('../pages/Reportes.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/categorias',
    name: 'Categorias',
    component: () => import('../pages/Categorias.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/medios-pago',
    name: 'MediosPago',
    component: () => import('../pages/MediosPago.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/datos-negocio',
    name: 'DatosNegocio',
    component: () => import('../pages/DatosNegocio.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/configuracion',
    name: 'Configuracion',
    component: () => import('../pages/Configuracion.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('pos_auth')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router