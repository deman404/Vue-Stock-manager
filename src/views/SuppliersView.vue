<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des Fournisseurs
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez votre base de données fournisseurs
        </p>
      </div>
      <button 
        @click="showAddModal = true"
        class="btn btn-primary mt-4 sm:mt-0"
      >
        <PlusIcon class="w-5 h-5 mr-2" />
        Nouveau Fournisseur
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="card p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un fournisseur..."
            class="input-field"
          >
        </div>
        <div>
          <select v-model="sortBy" class="input-field">
            <option value="name">Nom</option>
            <option value="createdAt">Date de création</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Suppliers Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="supplier in filteredSuppliers" 
        :key="supplier.id"
        class="card p-6 hover:shadow-lg transition-shadow animate-slide-up"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <TruckIcon class="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ supplier.name }}
              </h3>
              <p v-if="supplier.contact" class="text-sm text-gray-500 dark:text-gray-400">
                Contact: {{ supplier.contact }}
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-2 mb-4">
          <div class="flex items-center space-x-2">
            <EnvelopeIcon class="w-4 h-4 text-gray-400" />
            <span class="text-sm text-gray-600 dark:text-gray-300">{{ supplier.email }}</span>
          </div>
          <div v-if="supplier.phone" class="flex items-center space-x-2">
            <PhoneIcon class="w-4 h-4 text-gray-400" />
            <span class="text-sm text-gray-600 dark:text-gray-300">{{ supplier.phone }}</span>
          </div>
          <div v-if="supplier.address" class="flex items-start space-x-2">
            <MapPinIcon class="w-4 h-4 text-gray-400 mt-0.5" />
            <span class="text-sm text-gray-600 dark:text-gray-300">{{ supplier.address }}</span>
          </div>
        </div>

        <div class="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Fournisseur depuis {{ formatDate(supplier.createdAt) }}
        </div>

        <div class="flex space-x-2">
          <button 
            @click="editSupplier(supplier)"
            class="btn btn-secondary flex-1 text-sm"
          >
            <PencilIcon class="w-4 h-4 mr-1" />
            Modifier
          </button>
          <button 
            @click="viewOrders(supplier)"
            class="btn btn-primary flex-1 text-sm"
          >
            <ShoppingCartIcon class="w-4 h-4 mr-1" />
            Commandes
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="filteredSuppliers.length === 0" class="text-center py-12">
      <TruckIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Aucun fournisseur trouvé
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        Aucun fournisseur ne correspond à vos critères de recherche.
      </p>
      <button 
        @click="resetFilters"
        class="btn btn-secondary"
      >
        Réinitialiser les filtres
      </button>
    </div>

    <!-- Add/Edit Supplier Modal -->
    <div v-if="showAddModal || editingSupplier" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ editingSupplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur' }}
          </h2>
        </div>
        
        <form @submit.prevent="saveSupplier" class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom de l'entreprise *
              </label>
              <input
                v-model="supplierForm.name"
                type="text"
                required
                class="input-field mt-1"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email *
              </label>
              <input
                v-model="supplierForm.email"
                type="email"
                required
                class="input-field mt-1"
              >
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Téléphone
              </label>
              <input
                v-model="supplierForm.phone"
                type="tel"
                class="input-field mt-1"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Personne de contact
              </label>
              <input
                v-model="supplierForm.contact"
                type="text"
                class="input-field mt-1"
              >
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Adresse
            </label>
            <textarea
              v-model="supplierForm.address"
              rows="3"
              class="input-field mt-1"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button 
              type="button"
              @click="closeModal"
              class="btn btn-secondary"
            >
              Annuler
            </button>
            <button 
              type="submit"
              class="btn btn-primary"
            >
              {{ editingSupplier ? 'Mettre à jour' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Supplier } from '@/types'
import {
  PlusIcon,
  TruckIcon,
  PencilIcon,
  ShoppingCartIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/vue/24/outline'

const ordersStore = useOrdersStore()

const searchQuery = ref('')
const sortBy = ref('name')
const showAddModal = ref(false)
const editingSupplier = ref<Supplier | null>(null)

const supplierForm = reactive({
  name: '',
  email: '',
  phone: '',
  contact: '',
  address: ''
})

const filteredSuppliers = computed(() => {
  let filtered = [...ordersStore.suppliers]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(supplier => 
      supplier.name.toLowerCase().includes(query) ||
      supplier.email.toLowerCase().includes(query) ||
      (supplier.contact && supplier.contact.toLowerCase().includes(query))
    )
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  return filtered
})

const formatDate = (date: Date) => {
  return format(date, 'dd MMM yyyy', { locale: fr })
}

const resetFilters = () => {
  searchQuery.value = ''
  sortBy.value = 'name'
}

const resetForm = () => {
  Object.assign(supplierForm, {
    name: '',
    email: '',
    phone: '',
    contact: '',
    address: ''
  })
}

const editSupplier = (supplier: Supplier) => {
  editingSupplier.value = supplier
  Object.assign(supplierForm, {
    name: supplier.name,
    email: supplier.email,
    phone: supplier.phone || '',
    contact: supplier.contact || '',
    address: supplier.address || ''
  })
}

const closeModal = () => {
  showAddModal.value = false
  editingSupplier.value = null
  resetForm()
}

const saveSupplier = () => {
  if (editingSupplier.value) {
    // Update existing supplier (would need to implement in store)
    console.log('Update supplier:', editingSupplier.value.id, supplierForm)
  } else {
    // Create new supplier
    ordersStore.addSupplier({ ...supplierForm })
  }
  closeModal()
}

const viewOrders = (supplier: Supplier) => {
  // TODO: Navigate to orders filtered by supplier
  console.log('View orders for supplier:', supplier.id)
}
</script>