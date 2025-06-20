<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">
            Boutique en Ligne
          </h1>
          <p class="text-primary-100 mt-1">
            Découvrez notre catalogue de produits
          </p>
        </div>
        <div class="flex items-center space-x-4">
          <div class="relative">
            <button 
              @click="showCart = !showCart"
              class="bg-white/20 backdrop-blur-sm rounded-lg p-3 hover:bg-white/30 transition-colors"
            >
              <ShoppingCartIcon class="w-6 h-6" />
              <span 
                v-if="cartItemsCount > 0"
                class="absolute -top-2 -right-2 bg-warning-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {{ cartItemsCount }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un produit..."
            class="input-field"
          >
        </div>
        <div>
          <select v-model="selectedCategory" class="input-field">
            <option value="">Toutes les catégories</option>
            <option v-for="category in productsStore.categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        <div>
          <select v-model="priceRange" class="input-field">
            <option value="">Tous les prix</option>
            <option value="0-100">0€ - 100€</option>
            <option value="100-500">100€ - 500€</option>
            <option value="500-1000">500€ - 1000€</option>
            <option value="1000+">1000€+</option>
          </select>
        </div>
        <div>
          <select v-model="sortBy" class="input-field">
            <option value="name">Nom</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="newest">Plus récent</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Products Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id"
        class="card overflow-hidden hover:shadow-lg transition-shadow animate-slide-up group"
      >
        <div class="relative aspect-w-16 aspect-h-9">
          <img 
            :src="product.image || 'https://images.pexels.com/photos/163117/pexels-photo-163117.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'"
            :alt="product.name"
            class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          >
          <div v-if="product.stock === 0" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span class="text-white font-medium">Rupture de stock</span>
          </div>
          <div v-else-if="product.stock <= product.minStock" class="absolute top-2 right-2">
            <span class="bg-warning-500 text-white text-xs px-2 py-1 rounded-full">
              Stock limité
            </span>
          </div>
        </div>
        
        <div class="p-4">
          <div class="mb-2">
            <span class="text-xs text-primary-600 dark:text-primary-400 font-medium">
              {{ product.category }}
            </span>
          </div>
          
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {{ product.name }}
          </h3>
          
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {{ product.description }}
          </p>
          
          <div class="flex items-center justify-between mb-4">
            <div>
              <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {{ formatCurrency(product.price) }}
              </span>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Stock: {{ product.stock }}
              </p>
            </div>
          </div>
          
          <div class="flex space-x-2">
            <button 
              @click="addToCart(product)"
              :disabled="product.stock === 0"
              class="btn btn-primary flex-1 text-sm"
              :class="{ 'opacity-50 cursor-not-allowed': product.stock === 0 }"
            >
              <ShoppingCartIcon class="w-4 h-4 mr-1" />
              {{ product.stock === 0 ? 'Indisponible' : 'Ajouter' }}
            </button>
            <button 
              @click="viewProduct(product)"
              class="btn btn-secondary text-sm"
            >
              <EyeIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="filteredProducts.length === 0" class="text-center py-12">
      <CubeIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Aucun produit trouvé
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        Aucun produit ne correspond à vos critères de recherche.
      </p>
      <button 
        @click="resetFilters"
        class="btn btn-secondary"
      >
        Réinitialiser les filtres
      </button>
    </div>

    <!-- Shopping Cart Sidebar -->
    <Transition name="slide">
      <div v-if="showCart" class="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Panier ({{ cartItemsCount }})
            </h2>
            <button 
              @click="showCart = false"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <div v-if="cart.length === 0" class="p-6 text-center">
          <ShoppingCartIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-gray-400">
            Votre panier est vide
          </p>
        </div>

        <div v-else class="p-6 space-y-4">
          <div 
            v-for="item in cart" 
            :key="item.product.id"
            class="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <img 
              :src="item.product.image || 'https://images.pexels.com/photos/163117/pexels-photo-163117.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'"
              :alt="item.product.name"
              class="w-16 h-16 rounded-lg object-cover"
            >
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-gray-900 dark:text-white truncate">
                {{ item.product.name }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatCurrency(item.product.price) }}
              </p>
              <div class="flex items-center space-x-2 mt-2">
                <button 
                  @click="updateQuantity(item.product.id, item.quantity - 1)"
                  class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm"
                >
                  -
                </button>
                <span class="text-sm font-medium">{{ item.quantity }}</span>
                <button 
                  @click="updateQuantity(item.product.id, item.quantity + 1)"
                  :disabled="item.quantity >= item.product.stock"
                  class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
            <div class="text-right">
              <p class="font-medium text-gray-900 dark:text-white">
                {{ formatCurrency(item.product.price * item.quantity) }}
              </p>
              <button 
                @click="removeFromCart(item.product.id)"
                class="text-error-600 hover:text-error-700 text-sm mt-1"
              >
                Supprimer
              </button>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div class="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{{ formatCurrency(cartTotal) }}</span>
            </div>
            <button 
              @click="checkout"
              class="btn btn-primary w-full mt-4"
            >
              Commander
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Cart Backdrop -->
    <div 
      v-if="showCart"
      class="fixed inset-0 bg-black bg-opacity-50 z-40"
      @click="showCart = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useProductsStore } from '@/stores/products'
import type { Product } from '@/types'
import {
  ShoppingCartIcon,
  CubeIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const productsStore = useProductsStore()

const searchQuery = ref('')
const selectedCategory = ref('')
const priceRange = ref('')
const sortBy = ref('name')
const showCart = ref(false)

const cart = ref<Array<{ product: Product; quantity: number }>>([])

const filteredProducts = computed(() => {
  let filtered = productsStore.products.filter(product => product.stock > 0 || true) // Show all products

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    )
  }

  // Category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(product => product.category === selectedCategory.value)
  }

  // Price range filter
  if (priceRange.value) {
    const [min, max] = priceRange.value.split('-').map(p => p.replace('+', ''))
    filtered = filtered.filter(product => {
      if (max) {
        return product.price >= parseInt(min) && product.price <= parseInt(max)
      } else {
        return product.price >= parseInt(min)
      }
    })
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  return filtered
})

const cartItemsCount = computed(() => 
  cart.value.reduce((sum, item) => sum + item.quantity, 0)
)

const cartTotal = computed(() => 
  cart.value.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
)

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  priceRange.value = ''
  sortBy.value = 'name'
}

const addToCart = (product: Product) => {
  if (product.stock === 0) return

  const existingItem = cart.value.find(item => item.product.id === product.id)
  
  if (existingItem) {
    if (existingItem.quantity < product.stock) {
      existingItem.quantity++
    }
  } else {
    cart.value.push({ product, quantity: 1 })
  }
}

const updateQuantity = (productId: string, newQuantity: number) => {
  const item = cart.value.find(item => item.product.id === productId)
  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else if (newQuantity <= item.product.stock) {
      item.quantity = newQuantity
    }
  }
}

const removeFromCart = (productId: string) => {
  const index = cart.value.findIndex(item => item.product.id === productId)
  if (index >= 0) {
    cart.value.splice(index, 1)
  }
}

const viewProduct = (product: Product) => {
  // TODO: Implement product detail view
  console.log('View product:', product.id)
}

const checkout = () => {
  // TODO: Implement checkout process
  console.log('Checkout with cart:', cart.value)
  alert('Fonctionnalité de commande à implémenter')
}
</script>