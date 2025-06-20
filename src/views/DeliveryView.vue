<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des Livraisons
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Suivez et gérez les livraisons en cours
        </p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              À Livrer
            </p>
            <p class="text-2xl font-bold text-warning-600 dark:text-warning-400 mt-2">
              {{ pendingDeliveries.length }}
            </p>
          </div>
          <div class="p-3 rounded-full bg-warning-100 dark:bg-warning-900/20">
            <ClockIcon class="w-6 h-6 text-warning-600 dark:text-warning-400" />
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              En Transit
            </p>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {{ inTransitDeliveries.length }}
            </p>
          </div>
          <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <TruckIcon class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Livrées Aujourd'hui
            </p>
            <p class="text-2xl font-bold text-success-600 dark:text-success-400 mt-2">
              {{ todayDeliveries.length }}
            </p>
          </div>
          <div class="p-3 rounded-full bg-success-100 dark:bg-success-900/20">
            <CheckCircleIcon class="w-6 h-6 text-success-600 dark:text-success-400" />
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Taux de Réussite
            </p>
            <p class="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-2">
              95%
            </p>
          </div>
          <div class="p-3 rounded-full bg-primary-100 dark:bg-primary-900/20">
            <ChartBarIcon class="w-6 h-6 text-primary-600 dark:text-primary-400" />
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
            placeholder="Rechercher une commande..."
            class="input-field"
          >
        </div>
        <div>
          <select v-model="statusFilter" class="input-field">
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="assigned">Assignée</option>
            <option value="picked_up">Récupérée</option>
            <option value="in_transit">En transit</option>
            <option value="delivered">Livrée</option>
            <option value="failed">Échec</option>
          </select>
        </div>
        <div>
          <select v-model="livreurFilter" class="input-field">
            <option value="">Tous les livreurs</option>
            <option value="livreur1">Jean Dupont</option>
            <option value="livreur2">Marie Martin</option>
            <option value="livreur3">Pierre Durand</option>
          </select>
        </div>
        <div>
          <input
            v-model="dateFilter"
            type="date"
            class="input-field"
          >
        </div>
      </div>
    </div>

    <!-- Deliveries Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Commande
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Client
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Adresse
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Livreur
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr 
              v-for="delivery in filteredDeliveries" 
              :key="delivery.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ delivery.orderNumber }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ formatCurrency(delivery.total) }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ delivery.clientName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                  {{ delivery.address }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ delivery.livreur || 'Non assigné' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusBadgeClass(delivery.status)"
                >
                  {{ getStatusLabel(delivery.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(delivery.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button 
                    v-if="delivery.status === 'pending'"
                    @click="assignDelivery(delivery)"
                    class="text-primary-600 hover:text-primary-900 dark:text-primary-400"
                  >
                    Assigner
                  </button>
                  <button 
                    v-if="delivery.status !== 'delivered' && delivery.status !== 'failed'"
                    @click="updateStatus(delivery)"
                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                  >
                    Mettre à jour
                  </button>
                  <button 
                    @click="trackDelivery(delivery)"
                    class="text-gray-600 hover:text-gray-900 dark:text-gray-400"
                  >
                    Suivre
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="filteredDeliveries.length === 0" class="text-center py-12">
      <TruckIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Aucune livraison trouvée
      </h3>
      <p class="text-gray-500 dark:text-gray-400">
        Aucune livraison ne correspond à vos critères de recherche.
      </p>
    </div>

    <!-- Assign Delivery Modal -->
    <div v-if="showAssignModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Assigner un livreur
          </h2>
        </div>
        
        <form @submit.prevent="confirmAssignment" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Commande: {{ selectedDelivery?.orderNumber }}
            </label>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Livreur
            </label>
            <select v-model="assignForm.livreur" class="input-field mt-1" required>
              <option value="">Sélectionner un livreur</option>
              <option value="Jean Dupont">Jean Dupont</option>
              <option value="Marie Martin">Marie Martin</option>
              <option value="Pierre Durand">Pierre Durand</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date de livraison prévue
            </label>
            <input
              v-model="assignForm.scheduledDate"
              type="datetime-local"
              required
              class="input-field mt-1"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <textarea
              v-model="assignForm.notes"
              rows="3"
              class="input-field mt-1"
              placeholder="Instructions particulières..."
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button 
              type="button"
              @click="showAssignModal = false"
              class="btn btn-secondary"
            >
              Annuler
            </button>
            <button 
              type="submit"
              class="btn btn-primary"
            >
              Assigner
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
import {
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

const ordersStore = useOrdersStore()

const searchQuery = ref('')
const statusFilter = ref('')
const livreurFilter = ref('')
const dateFilter = ref('')
const showAssignModal = ref(false)
const selectedDelivery = ref<any>(null)

const assignForm = reactive({
  livreur: '',
  scheduledDate: '',
  notes: ''
})

// Mock delivery data based on orders
const deliveries = computed(() => {
  return ordersStore.orders
    .filter(order => order.type === 'vente')
    .map(order => {
      const client = ordersStore.clients.find(c => c.id === order.clientId)
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        clientName: client?.name || 'Client inconnu',
        address: order.deliveryAddress || client?.address || 'Adresse non définie',
        total: order.total,
        status: getDeliveryStatus(order.status),
        livreur: getRandomLivreur(),
        date: order.createdAt
      }
    })
})

const filteredDeliveries = computed(() => {
  let filtered = [...deliveries.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(delivery => 
      delivery.orderNumber.toLowerCase().includes(query) ||
      delivery.clientName.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(delivery => delivery.status === statusFilter.value)
  }

  // Livreur filter
  if (livreurFilter.value) {
    filtered = filtered.filter(delivery => delivery.livreur === livreurFilter.value)
  }

  // Date filter
  if (dateFilter.value) {
    const filterDate = new Date(dateFilter.value)
    filtered = filtered.filter(delivery => {
      const deliveryDate = new Date(delivery.date)
      return deliveryDate.toDateString() === filterDate.toDateString()
    })
  }

  return filtered
})

const pendingDeliveries = computed(() => 
  deliveries.value.filter(d => d.status === 'pending' || d.status === 'assigned')
)

const inTransitDeliveries = computed(() => 
  deliveries.value.filter(d => d.status === 'picked_up' || d.status === 'in_transit')
)

const todayDeliveries = computed(() => {
  const today = new Date().toDateString()
  return deliveries.value.filter(d => 
    d.status === 'delivered' && 
    new Date(d.date).toDateString() === today
  )
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatDate = (date: Date) => {
  return format(date, 'dd MMM yyyy', { locale: fr })
}

const getDeliveryStatus = (orderStatus: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'pending',
    'confirmed': 'assigned',
    'processing': 'picked_up',
    'shipped': 'in_transit',
    'delivered': 'delivered',
    'cancelled': 'failed'
  }
  return statusMap[orderStatus] || 'pending'
}

const getRandomLivreur = () => {
  const livreurs = ['Jean Dupont', 'Marie Martin', 'Pierre Durand', null]
  return livreurs[Math.floor(Math.random() * livreurs.length)]
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    assigned: 'Assignée',
    picked_up: 'Récupérée',
    in_transit: 'En transit',
    delivered: 'Livrée',
    failed: 'Échec'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    picked_up: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    in_transit: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    delivered: 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400',
    failed: 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const assignDelivery = (delivery: any) => {
  selectedDelivery.value = delivery
  showAssignModal.value = true
  assignForm.livreur = ''
  assignForm.scheduledDate = ''
  assignForm.notes = ''
}

const confirmAssignment = () => {
  // TODO: Implement delivery assignment
  console.log('Assigning delivery:', selectedDelivery.value?.id, assignForm)
  showAssignModal.value = false
}

const updateStatus = (delivery: any) => {
  // TODO: Implement status update
  console.log('Update delivery status:', delivery.id)
}

const trackDelivery = (delivery: any) => {
  // TODO: Implement delivery tracking
  console.log('Track delivery:', delivery.id)
}
</script>