import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/products',
      name: 'Products',
      component: () => import('@/views/ProductsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/orders',
      name: 'Orders',
      component: () => import('@/views/OrdersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/orders/new',
      name: 'NewOrder',
      component: () => import('@/views/NewOrderView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/clients',
      name: 'Clients',
      component: () => import('@/views/ClientsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/suppliers',
      name: 'Suppliers',
      component: () => import('@/views/SuppliersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/inventory',
      name: 'Inventory',
      component: () => import('@/views/InventoryView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reports',
      name: 'Reports',
      component: () => import('@/views/ReportsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/delivery',
      name: 'Delivery',
      component: () => import('@/views/DeliveryView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'manager', 'livreur'] }
    },
    {
      path: '/shop',
      name: 'Shop',
      component: () => import('@/views/ShopView.vue'),
      meta: { requiresAuth: true, roles: ['client'] }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else if (
    Array.isArray(to.meta.roles) &&
    (!authStore.user?.roles || (Array.isArray(authStore.user.roles)
      ? !authStore.user.roles.some((role: string) => (to.meta.roles as string[]).includes(role))
      : !(to.meta.roles as string[]).includes(authStore.user.roles))
    )
  ) {
    next('/')
  } else {
    next()
  }
})

export default router