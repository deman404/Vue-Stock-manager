<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Rapports et Analyses
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Analysez vos performances et générez des rapports
        </p>
      </div>
      <button 
        @click="exportReport"
        class="btn btn-primary mt-4 sm:mt-0"
      >
        <DocumentArrowDownIcon class="w-5 h-5 mr-2" />
        Exporter PDF
      </button>
    </div>

    <!-- Date Range Filter -->
    <div class="card p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date de début
          </label>
          <input
            v-model="dateRange.start"
            type="date"
            class="input-field mt-1"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date de fin
          </label>
          <input
            v-model="dateRange.end"
            type="date"
            class="input-field mt-1"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Type de rapport
          </label>
          <select v-model="reportType" class="input-field mt-1">
            <option value="sales">Ventes</option>
            <option value="inventory">Inventaire</option>
            <option value="products">Produits</option>
          </select>
        </div>
        <div class="flex items-end">
          <button 
            @click="generateReport"
            class="btn btn-secondary w-full"
          >
            Générer
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Chiffre d'Affaires
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {{ formatCurrency(reportData.totalRevenue) }}
            </p>
            <p class="text-sm text-success-600 dark:text-success-400 mt-1">
              +12% vs période précédente
            </p>
          </div>
          <div class="p-3 rounded-full bg-success-100 dark:bg-success-900/20">
            <CurrencyEuroIcon class="w-6 h-6 text-success-600 dark:text-success-400" />
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Commandes
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {{ reportData.totalOrders }}
            </p>
            <p class="text-sm text-primary-600 dark:text-primary-400 mt-1">
              {{ reportData.avgOrderValue }} € / commande
            </p>
          </div>
          <div class="p-3 rounded-full bg-primary-100 dark:bg-primary-900/20">
            <ShoppingCartIcon class="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Produits Vendus
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {{ reportData.totalProductsSold }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ reportData.uniqueProducts }} produits différents
            </p>
          </div>
          <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <CubeIcon class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Marge Brute
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {{ formatCurrency(reportData.grossMargin) }}
            </p>
            <p class="text-sm text-warning-600 dark:text-warning-400 mt-1">
              {{ reportData.marginPercentage }}% de marge
            </p>
          </div>
          <div class="p-3 rounded-full bg-warning-100 dark:bg-warning-900/20">
            <ChartBarIcon class="w-6 h-6 text-warning-600 dark:text-warning-400" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Sales Chart -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Évolution des Ventes
        </h2>
        <div class="h-64">
          <Line
            :data="salesChartData"
            :options="chartOptions"
          />
        </div>
      </div>

      <!-- Top Products -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Produits les Plus Vendus
        </h2>
        <div class="space-y-4">
          <div 
            v-for="(product, index) in reportData.topProducts" 
            :key="product.id"
            class="flex items-center space-x-4"
          >
            <div class="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-primary-600 dark:text-primary-400">
                {{ index + 1 }}
              </span>
            </div>
            <img 
              :src="product.image || 'https://images.pexels.com/photos/163117/pexels-photo-163117.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'"
              :alt="product.name"
              class="w-12 h-12 rounded-lg object-cover"
            >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ product.name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ product.quantitySold }} vendus
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ formatCurrency(product.revenue) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Table -->
    <div class="card overflow-hidden">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Détail des {{ reportType === 'sales' ? 'Ventes' : reportType === 'inventory' ? 'Stocks' : 'Produits' }}
        </h2>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr v-if="reportType === 'sales'">
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Commande
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Client
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Articles
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total
              </th>
            </tr>
            <tr v-else-if="reportType === 'inventory'">
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Produit
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Stock
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Valeur
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <!-- Sales rows -->
            <tr 
              v-if="reportType === 'sales'"
              v-for="order in filteredOrders" 
              :key="order.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ order.orderNumber }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(order.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ getClientName(order.clientId) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ order.items.length }} article(s)
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                {{ formatCurrency(order.total) }}
              </td>
            </tr>
            
            <!-- Inventory rows -->
            <tr 
              v-if="reportType === 'inventory'"
              v-for="product in productsStore.products" 
              :key="product.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img 
                    :src="product.image || 'https://images.pexels.com/photos/163117/pexels-photo-163117.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'"
                    :alt="product.name"
                    class="w-10 h-10 rounded-lg object-cover mr-3"
                  >
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ product.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ product.sku }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ product.stock }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatCurrency(product.stock * product.cost) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStockBadgeClass(product)"
                >
                  {{ getStockStatus(product) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { useProductsStore } from '@/stores/products'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import type { Product } from '@/types'
import {
  DocumentArrowDownIcon,
  CurrencyEuroIcon,
  ShoppingCartIcon,
  CubeIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const ordersStore = useOrdersStore()
const productsStore = useProductsStore()

const reportType = ref('sales')
const dateRange = reactive({
  start: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
  end: format(new Date(), 'yyyy-MM-dd')
})

const filteredOrders = computed(() => {
  const startDate = new Date(dateRange.start)
  const endDate = new Date(dateRange.end)
  
  return ordersStore.completedOrders.filter(order => {
    const orderDate = new Date(order.createdAt)
    return orderDate >= startDate && orderDate <= endDate
  })
})

const reportData = computed(() => {
  const orders = filteredOrders.value
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orders.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  
  // Calculate products sold
  const productSales = new Map()
  let totalProductsSold = 0
  
  orders.forEach(order => {
    order.items.forEach(item => {
      totalProductsSold += item.quantity
      if (productSales.has(item.productId)) {
        const current = productSales.get(item.productId)
        productSales.set(item.productId, {
          ...current,
          quantitySold: current.quantitySold + item.quantity,
          revenue: current.revenue + item.total
        })
      } else {
        productSales.set(item.productId, {
          ...item.product,
          quantitySold: item.quantity,
          revenue: item.total
        })
      }
    })
  })
  
  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
  
  // Calculate gross margin
  const totalCost = orders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => {
      return itemSum + (item.product.cost * item.quantity)
    }, 0)
  }, 0)
  
  const grossMargin = totalRevenue - totalCost
  const marginPercentage = totalRevenue > 0 ? Math.round((grossMargin / totalRevenue) * 100) : 0
  
  return {
    totalRevenue,
    totalOrders,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    totalProductsSold,
    uniqueProducts: productSales.size,
    grossMargin,
    marginPercentage,
    topProducts
  }
})

const salesChartData = computed(() => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date
  })
  
  const dailySales = last7Days.map(date => {
    const dayOrders = filteredOrders.value.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate.toDateString() === date.toDateString()
    })
    return dayOrders.reduce((sum, order) => sum + order.total, 0)
  })
  
  return {
    labels: last7Days.map(date => format(date, 'dd/MM')),
    datasets: [
      {
        label: 'Ventes (€)',
        data: dailySales,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value: any) {
          return formatCurrency(value)
        }
      }
    }
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatDate = (date: Date) => {
  return format(date, 'dd MMM yyyy', { locale: fr })
}

const getClientName = (clientId?: string) => {
  if (!clientId) return 'Client inconnu'
  const client = ordersStore.clients.find(c => c.id === clientId)
  return client?.name || 'Client inconnu'
}

const getStockStatus = (product: Product) => {
  if (product.stock === 0) return 'Rupture'
  if (product.stock <= product.minStock) return 'Faible'
  return 'En stock'
}

const getStockBadgeClass = (product: Product) => {
  if (product.stock === 0) {
    return 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400'
  }
  if (product.stock <= product.minStock) {
    return 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400'
  }
  return 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400'
}

const generateReport = () => {
  // Refresh data based on new filters
  console.log('Generating report for:', reportType.value, dateRange)
}

const exportReport = () => {
  // TODO: Implement PDF export
  console.log('Exporting report to PDF')
}
</script>