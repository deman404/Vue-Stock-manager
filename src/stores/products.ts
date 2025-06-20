import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '@/types'
import path from '@/plugins/path'

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const lowStockThreshold = 5
  const lowStockProducts = computed(() => 
    products.value.filter(p => p.stock > 0 && p.stock <= lowStockThreshold)
  )
  const outOfStockProducts = computed(() => 
    products.value.filter(p => p.stock === 0)
  )

  // Fetch all products
  const fetchProducts = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await path.get('/All_Products')
      products.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error loading products'
    } finally {
      isLoading.value = false
    }
  }

  // Create new product (admin only)
  const createProduct = async (productData: {
    name: string
    description?: string
    price: number
    stock: number
    image?: string
  }) => {
    isLoading.value = true
    try {
      const response = await path.post('/products', productData)
      products.value.unshift(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error creating product'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update product (admin only)
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    isLoading.value = true
    try {
      const response = await path.put(`/products/${id}`, updates)
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error updating product'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Delete product (admin only)
  const deleteProduct = async (id: string) => {
    isLoading.value = true
    try {
      await path.delete(`/products/${id}`)
      products.value = products.value.filter(p => p.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error deleting product'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single product
  const getProductById = (id: string) => {
    return products.value.find(p => p.id === id)
  }

  return {
    products,
    isLoading,
    error,
    lowStockProducts,
    outOfStockProducts,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById
  }
})