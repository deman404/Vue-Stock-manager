import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Order } from '@/types'
import path from '@/plugins/path'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const pendingOrders = computed(() => 
    orders.value.filter(o => o.status === 'pending')
  )
  const confirmedOrders = computed(() => 
    orders.value.filter(o => o.status === 'confirmed')
  )
  const deliveredOrders = computed(() => 
    orders.value.filter(o => o.status === 'delivered')
  )
  const cancelledOrders = computed(() => 
    orders.value.filter(o => o.status === 'cancelled')
  )

  // Fetch orders based on user role
  const fetchOrders = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await path.get('/orders')
      orders.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error loading orders'
    } finally {
      isLoading.value = false
    }
  }

  // Create new order
  const createOrder = async (items: Array<{
    product_id: string
    quantity: number
  }>) => {
    isLoading.value = true
    try {
      const response = await path.post('/orders', { items })
      orders.value.unshift(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error creating order'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update order (for delivery users)
  const takeOrder = async (orderId: string) => {
    try {
      const response = await path.post(`/orders/${orderId}/take`)
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index] = response.data.order
      }
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error taking order')
    }
  }

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await path.put(`/orders/${orderId}`, { status })
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error updating order status')
    }
  }

  // Get single order
  const getOrderById = async (id: string) => {
    isLoading.value = true
    try {
      const response = await path.get(`/orders/${id}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error loading order'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Stripe checkout
  const createCheckoutSession = async (items: Array<{
    product_id: string
    quantity: number
  }>) => {
    try {
      const response = await path.post('/orders/checkout', { items })
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error creating checkout session')
    }
  }

  return {
    orders,
    isLoading,
    error,
    pendingOrders,
    confirmedOrders,
    deliveredOrders,
    cancelledOrders,
    fetchOrders,
    createOrder,
    takeOrder,
    updateOrderStatus,
    getOrderById,
    createCheckoutSession
  }
})