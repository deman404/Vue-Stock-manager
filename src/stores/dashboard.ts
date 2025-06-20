import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DashboardStats, Alert } from '@/types/index'
import { useProductsStore } from './products'
import { useOrdersStore } from './orders'
import { useAdminStore } from './admin'

export const useDashboardStore = defineStore('dashboard', () => {
  const alerts = ref<Alert[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  const productsStore = useProductsStore()
  const ordersStore = useOrdersStore()
  const adminStore = useAdminStore()

  const fetchStats = async () => {
    isLoading.value = true
    error.value = null
    try {
      // Fetch all required data in parallel
      await Promise.all([
        productsStore.fetchProducts(),
        ordersStore.fetchOrders(),
        adminStore.fetchAllUsers()
      ])
      generateAlerts()
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load dashboard data'
    } finally {
      isLoading.value = false
    }
  }

  const stats = computed((): DashboardStats => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    // Get completed orders (assuming they're orders with status 'delivered')
    const completedOrders = ordersStore.orders.filter(order => order.status === 'delivered')
    
    // Monthly revenue calculation
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const monthOrders = completedOrders.filter((order: { createdAt: string | Date }) => {
        const orderDate = new Date(order.createdAt)
        return orderDate.getMonth() === i && orderDate.getFullYear() === currentYear
      })
      return monthOrders.reduce((sum: number, order: { total: number }) => sum + order.total, 0)
    })

    // Weekly revenue calculation (last 4 weeks)
    const weeklyRevenue = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i * 7))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const weekOrders = completedOrders.filter((order: { createdAt: string | Date }) => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= weekStart && orderDate < weekEnd
      })
      return weekOrders.reduce((sum: number, order: { total: number }) => sum + order.total, 0)
    }).reverse()

    // Product sales analysis
    const productSales = new Map<string, { stock: number; revenue: number }>()
    completedOrders.forEach((order: { items: any[] }) => {
      order.items.forEach((item: { productId: string; quantity: number; total: number }) => {
        if (productSales.has(item.productId)) {
          const current = productSales.get(item.productId)!
          productSales.set(item.productId, {
            stock: current.stock + item.quantity,
            revenue: current.revenue + item.total
          })
        } else {
          productSales.set(item.productId, {
            stock: item.quantity,
            revenue: item.total
          })
        }
      })
    })

    const topProducts = Array.from(productSales.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([productId, stats]) => {
        const product = productsStore.getProductById(productId)
        return {
          product: product!,
          sold: stats.stock,
          revenue: stats.revenue
        }
      })

    // User statistics
    // User statistics
const deliveryUsers = adminStore.users.filter(user => 
  user.roles === 'delivery'
).length

    const newUsersThisMonth = adminStore.users.filter((user: { createdAt: string | Date }) => {
      const userDate = new Date(user.createdAt)
      return userDate.getMonth() === currentMonth && 
             userDate.getFullYear() === currentYear
    }).length

    return {
      // Basic stats
      totalProducts: productsStore.products.length,
      totalOrders: ordersStore.orders.length,
      totalUsers: adminStore.users.length,
      totalRevenue: completedOrders.reduce((sum: number, order: { total: number }) => sum + order.total, 0),
      
      // Inventory stats
      lowStockProducts: productsStore.lowStockProducts.length,
      outOfStockProducts: productsStore.outOfStockProducts.length,
      
      // Order stats
      pendingOrders: ordersStore.orders.filter((o: { status: string }) => o.status === 'pending').length,
      processingOrders: ordersStore.orders.filter((o: { status: string }) => o.status === 'processing').length,
      shippedOrders: ordersStore.orders.filter((o: { status: string }) => o.status === 'shipped').length,
      deliveredOrders: completedOrders.length,
      cancelledOrders: ordersStore.orders.filter((o: { status: string }) => o.status === 'cancelled').length,
      
      // User stats
      deliveryUsers,
      newUsersThisMonth,
      
      // Analytics
      monthlyRevenue,
      weeklyRevenue,
      topProducts,
      averageOrderValue: completedOrders.length > 0 
        ? completedOrders.reduce((sum: number, order: { total: number }) => sum + order.total, 0) / 
          completedOrders.length
        : 0
    }
  })

  const unreadAlerts = computed(() => 
    alerts.value.filter(alert => !alert.read).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  )

  const generateAlerts = () => {
    // Clear old resolved alerts
    alerts.value = alerts.value.filter(alert => 
      (alert.type === 'low_stock' && 
       productsStore.lowStockProducts.some((p: { id: string }) => p.id === alert.productId)) ||
      (alert.type === 'out_of_stock' && 
       productsStore.outOfStockProducts.some((p: { id: string }) => p.id === alert.productId))
    )

    // Generate low stock alerts
    productsStore.lowStockProducts.forEach((product: { id: string; name: string; stock: number }) => {
      const existingAlert = alerts.value.find(
        alert => alert.type === 'low_stock' && alert.productId === product.id
      )
      
      if (!existingAlert) {
        alerts.value.unshift({
          id: `alert-${Date.now()}-${product.id}`,
          type: 'low_stock',
          title: 'Stock faible',
          message: `Le produit "${product.name}" a un stock faible (${product.stock} restants)`,
          productId: product.id,
          read: false,
          createdAt: new Date(),
          priority: product.stock < 5 ? 'high' : 'medium'
        })
      }
    })

    // Generate out of stock alerts
    productsStore.outOfStockProducts.forEach((product: { id: string; name: string }) => {
      const existingAlert = alerts.value.find(
        alert => alert.type === 'out_of_stock' && alert.productId === product.id
      )
      
      if (!existingAlert) {
        alerts.value.unshift({
          id: `alert-${Date.now()}-${product.id}`,
          type: 'out_of_stock',
          title: 'Rupture de stock',
          message: `Le produit "${product.name}" est en rupture de stock`,
          productId: product.id,
          read: false,
          createdAt: new Date(),
          priority: 'critical'
        })
      }
    })

    // Generate order alerts (example)
    const pendingOrderCount = ordersStore.orders.filter((o: { status: string }) => o.status === 'pending').length
    if (pendingOrderCount > 10) {
      const existingAlert = alerts.value.find(
        alert => alert.type === 'pending_orders'
      )
      
      if (!existingAlert) {
        alerts.value.unshift({
          id: `alert-${Date.now()}-pending-orders`,
          type: 'pending_orders',
          title: 'Commandes en attente',
          message: `Vous avez ${pendingOrderCount} commandes en attente de traitement`,
          read: false,
          createdAt: new Date(),
          priority: 'medium'
        })
      }
    }
  }

  const markAlertAsRead = (alertId: string) => {
    const alert = alerts.value.find(a => a.id === alertId)
    if (alert) {
      alert.read = true
    }
  }

  const markAllAlertsAsRead = () => {
    alerts.value.forEach(alert => {
      alert.read = true
    })
  }

  return {
    alerts,
    stats,
    isLoading,
    error,
    unreadAlerts,
    fetchStats,
    generateAlerts,
    markAlertAsRead,
    markAllAlertsAsRead
  }
})