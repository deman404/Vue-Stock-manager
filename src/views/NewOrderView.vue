<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Nouvelle Commande
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Créer une nouvelle commande client ou fournisseur
        </p>
      </div>
      <router-link to="/orders" class="btn btn-secondary">
        <ArrowLeftIcon class="w-5 h-5 mr-2" />
        Retour
      </router-link>
    </div>

    <form @submit.prevent="createOrder" class="space-y-6">
      <!-- Order Type -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Type de commande
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="relative">
            <input
              v-model="orderForm.type"
              type="radio"
              value="vente"
              class="sr-only"
            >
            <div 
              class="p-4 border-2 rounded-lg cursor-pointer transition-colors"
              :class="orderForm.type === 'vente' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'"
            >
              <div class="flex items-center space-x-3">
                <ShoppingCartIcon class="w-6 h-6 text-primary-600" />
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">Commande Client</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Vente de produits à un client</p>
                </div>
              </div>
            </div>
          </label>
          
          <label class="relative">
            <input
              v-model="orderForm.type"
              type="radio"
              value="achat"
              class="sr-only"
            >
            <div 
              class="p-4 border-2 rounded-lg cursor-pointer transition-colors"
              :class="orderForm.type === 'achat' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'"
            >
              <div class="flex items-center space-x-3">
                <TruckIcon class="w-6 h-6 text-primary-600" />
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">Commande Fournisseur</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Achat de produits auprès d'un fournisseur</p>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Client/Supplier Selection -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {{ orderForm.type === 'vente' ? 'Client' : 'Fournisseur' }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ orderForm.type === 'vente' ? 'Sélectionner un client' : 'Sélectionner un fournisseur' }}
            </label>
            <select 
              v-if="orderForm.type === 'vente'"
              v-model="orderForm.clientId"
              class="input-field mt-1"
              required
            >
              <option value="">Choisir un client</option>
              <option v-for="client in ordersStore.clients" :key="client.id" :value="client.id">
                {{ client.name }}
              </option>
            </select>
            <select 
              v-else
              v-model="orderForm.supplierId"
              class="input-field mt-1"
              required
            >
              <option value="">Choisir un fournisseur</option>
              <option v-for="supplier in ordersStore.suppliers" :key="supplier.id" :value="supplier.id">
                {{ supplier.name }}
              </option>
            </select>
          </div>
          
          <div v-if="orderForm.type === 'vente'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Adresse de livraison
            </label>
            <textarea
              v-model="orderForm.deliveryAddress"
              rows="3"
              class="input-field mt-1"
              placeholder="Adresse complète de livraison"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Products Selection -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Produits
          </h2>
          <button 
            type="button"
            @click="showProductModal = true"
            class="btn btn-primary"
          >
            <PlusIcon class="w-5 h-5 mr-2" />
            Ajouter un produit
          </button>
        </div>

        <div v-if="orderForm.items.length === 0" class="text-center py-8">
          <CubeIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-gray-400">
            Aucun produit ajouté à la commande
          </p>
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="(item, index) in orderForm.items" 
            :key="index"
            class="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <img 
              :src="item.product?.image || 'https://images.pexels.com/photos/163117/pexels-photo-163117.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'"
              :alt="item.product?.name"
              class="w-16 h-16 rounded-lg object-cover"
            >
            <div class="flex-1">
              <h3 class="font-medium text-gray-900 dark:text-white">
                {{ item.product?.name }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatCurrency(item.unitPrice) }} × {{ item.quantity }}
              </p>
            </div>
            <div class="text-right">
              <p class="font-medium text-gray-900 dark:text-white">
                {{ formatCurrency(item.total) }}
              </p>
            </div>
            <button 
              type="button"
              @click="removeItem(index)"
              class="text-error-600 hover:text-error-700"
            >
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Order Summary -->
        <div v-if="orderForm.items.length > 0" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Sous-total:</span>
              <span class="font-medium">{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">TVA (20%):</span>
              <span class="font-medium">{{ formatCurrency(tax) }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{{ formatCurrency(total) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notes (optionnel)
        </h2>
        <textarea
          v-model="orderForm.notes"
          rows="3"
          class="input-field"
          placeholder="Notes ou instructions particulières..."
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-4">
        <router-link to="/orders" class="btn btn-secondary">
          Annuler
        </router-link>
        <button 
          type="submit"
          :disabled="orderForm.items.length === 0"
          class="btn btn-primary"
        >
          Créer la commande
        </button>
      </div>
    </form>

    <!-- Product Selection Modal -->
    <div v-if="showProductModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Sélectionner un produit
          </h2>
        </div>
        
        <div class="p-6">
          <div class="mb-4">
            <input
              v-model="productSearch"
              type="text"
              placeholder="Rechercher un produit..."
              class="input-field"
            >
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            <div 
              v-for="product in filteredProducts" 
              :key="product.id"
              @click="selectProduct(product)"
              class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <img 
                :src="product.image || 'https://images.pexels.com/photos/163117/pexels-photo-163117.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop'"
                :alt="product.name"
                class="w-full h-32 object-cover rounded-lg mb-3"
              >
              <h3 class="font-medium text-gray-900 dark:text-white">{{ product.name }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Stock: {{ product.stock }}</p>
              <p class="text-lg font-bold text-primary-600 dark:text-primary-400">
                {{ formatCurrency(product.price) }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="p-6 border-t border-gray-200 dark:border-gray-700">
          <button 
            @click="showProductModal = false"
            class="btn btn-secondary"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>

    <!-- Product Quantity Modal -->
    <div v-if="selectedProduct" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Ajouter {{ selectedProduct.name }}
          </h2>
        </div>
        
        <form @submit.prevent="addProductToOrder" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Quantité
            </label>
            <input
              v-model.number="productQuantity"
              type="number"
              min="1"
              :max="selectedProduct.stock"
              required
              class="input-field mt-1"
            >
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Stock disponible: {{ selectedProduct.stock }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Prix unitaire
            </label>
            <input
              v-model.number="productPrice"
              type="number"
              step="0.01"
              min="0"
              required
              class="input-field mt-1"
            >
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button 
              type="button"
              @click="selectedProduct = null"
              class="btn btn-secondary"
            >
              Annuler
            </button>
            <button 
              type="submit"
              class="btn btn-primary"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useProductsStore } from '@/stores/products'
import type { Product } from '@/types'
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  TruckIcon,
  PlusIcon,
  CubeIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const ordersStore = useOrdersStore()
const productsStore = useProductsStore()

const showProductModal = ref(false)
const selectedProduct = ref<Product | null>(null)
const productSearch = ref('')
const productQuantity = ref(1)
const productPrice = ref(0)

const orderForm = reactive({
  type: 'vente' as 'vente' | 'achat',
  clientId: '',
  supplierId: '',
  deliveryAddress: '',
  notes: '',
  items: [] as Array<{
    productId: string
    product: Product
    quantity: number
    unitPrice: number
    total: number
  }>
})

const filteredProducts = computed(() => {
  if (!productSearch.value) return productsStore.products
  
  const query = productSearch.value.toLowerCase()
  return productsStore.products.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.sku.toLowerCase().includes(query)
  )
})

const subtotal = computed(() => 
  orderForm.items.reduce((sum, item) => sum + item.total, 0)
)

const tax = computed(() => subtotal.value * 0.2)

const total = computed(() => subtotal.value + tax.value)

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const selectProduct = (product: Product) => {
  selectedProduct.value = product
  productQuantity.value = 1
  productPrice.value = product.price
  showProductModal.value = false
}

const addProductToOrder = () => {
  if (!selectedProduct.value) return

  const existingIndex = orderForm.items.findIndex(
    item => item.productId === selectedProduct.value!.id
  )

  if (existingIndex >= 0) {
    // Update existing item
    orderForm.items[existingIndex].quantity += productQuantity.value
    orderForm.items[existingIndex].total = 
      orderForm.items[existingIndex].quantity * orderForm.items[existingIndex].unitPrice
  } else {
    // Add new item
    orderForm.items.push({
      productId: selectedProduct.value.id,
      product: selectedProduct.value,
      quantity: productQuantity.value,
      unitPrice: productPrice.value,
      total: productQuantity.value * productPrice.value
    })
  }

  selectedProduct.value = null
}

const removeItem = (index: number) => {
  orderForm.items.splice(index, 1)
}

const createOrder = () => {
  try {
    const newOrder = ordersStore.createOrder({
      type: orderForm.type,
      clientId: orderForm.type === 'vente' ? orderForm.clientId : undefined,
      supplierId: orderForm.type === 'achat' ? orderForm.supplierId : undefined,
      items: orderForm.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      deliveryAddress: orderForm.deliveryAddress || undefined,
      notes: orderForm.notes || undefined
    })

    router.push('/orders')
  } catch (error) {
    console.error('Error creating order:', error)
  }
}
</script>