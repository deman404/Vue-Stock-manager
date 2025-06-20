<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 lg:pl-64">
    <div class="flex items-center justify-between px-4 py-3">
      <!-- Mobile menu button -->
      <button 
        @click="toggleSidebar"
        class="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Bars3Icon class="w-6 h-6" />
      </button>

      <!-- Breadcrumb -->
      <nav class="hidden lg:flex items-center space-x-2 text-sm">
        <HomeIcon class="w-4 h-4 text-gray-400" />
        <ChevronRightIcon class="w-4 h-4 text-gray-400" />
        <span class="text-gray-600 dark:text-gray-300 capitalize">{{ currentPageName }}</span>
      </nav>

      <!-- Right side -->
      <div class="flex items-center space-x-4">
        <!-- Theme toggle -->
        <button 
          @click="toggleTheme"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Toggle theme"
        >
          <SunIcon v-if="isDark" class="w-5 h-5" />
          <MoonIcon v-else class="w-5 h-5" />
        </button>

        <!-- Notifications -->
        <div class="relative">
          <button 
            @click="showNotifications = !showNotifications"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative"
          >
            <BellIcon class="w-5 h-5" />
            <span 
              v-if="unreadCount > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

          <!-- Notifications dropdown -->
          <Transition name="fade">
            <div 
              v-if="showNotifications"
              class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
            >
              <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-medium">Notifications</h3>
                  <button 
                    v-if="unreadCount > 0"
                    @click="markAllAsRead"
                    class="text-xs text-primary-600 hover:text-primary-700"
                  >
                    Tout marquer comme lu
                  </button>
                </div>
              </div>
              <div class="max-h-96 overflow-y-auto">
                <div v-if="recentAlerts.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">
                  Aucune notification
                </div>
                <div 
                  v-for="alert in recentAlerts" 
                  :key="alert.id"
                  class="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  :class="{ 'bg-primary-50 dark:bg-primary-900/20': !alert.read }"
                  @click="markAsRead(alert.id)"
                >
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                      <ExclamationTriangleIcon 
                        v-if="alert.type === 'low_stock' || alert.type === 'out_of_stock'"
                        class="w-5 h-5 text-warning-500"
                      />
                      <InformationCircleIcon 
                        v-else
                        class="w-5 h-5 text-primary-500"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ alert.title }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {{ alert.message }}
                      </p>
                      <p class="text-xs text-gray-400 mt-1">
                        {{ formatDate(alert.createdAt) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- User menu -->
        <div class="hidden lg:flex items-center space-x-3">
          <img 
            :src="authStore.user?.avatar || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'" 
            :alt="authStore.user?.name" 
            class="w-8 h-8 rounded-full object-cover"
          >
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ authStore.user?.name }}
          </span>
        </div>
      </div>
    </div>
  </header>

  <!-- Backdrop for notifications -->
  <div 
    v-if="showNotifications"
    class="fixed inset-0 z-40"
    @click="showNotifications = false"
  ></div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSidebarStore } from '@/stores/sidebar'
import { useDashboardStore } from '@/stores/dashboard'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Bars3Icon,
  BellIcon,
  HomeIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const authStore = useAuthStore()
const sidebarStore = useSidebarStore()
const dashboardStore = useDashboardStore()

const showNotifications = ref(false)
const isDark = ref(false)

const currentPageName = computed(() => {
  const routeNameMap: Record<string, string> = {
    'Dashboard': 'Tableau de bord',
    'Products': 'Produits',
    'Orders': 'Commandes',
    'NewOrder': 'Nouvelle commande',
    'Clients': 'Clients',
    'Suppliers': 'Fournisseurs',
    'Inventory': 'Inventaire',
    'Reports': 'Rapports',
    'Delivery': 'Livraisons',
    'Shop': 'Boutique',
    'Profile': 'Profil'
  }
  return routeNameMap[route.name as string] || 'Page'
})

const recentAlerts = computed(() => 
  dashboardStore.alerts.slice(0, 10)
)

const unreadCount = computed(() => 
  dashboardStore.unreadAlerts.length
)

const toggleSidebar = () => {
  sidebarStore.toggle()
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const markAsRead = (alertId: string) => {
  dashboardStore.markAlertAsRead(alertId)
}

const markAllAsRead = () => {
  dashboardStore.markAllAlertsAsRead()
}

const formatDate = (date: Date) => {
  return format(date, 'dd MMM yyyy à HH:mm', { locale: fr })
}

// Initialize theme
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  isDark.value = savedTheme === 'dark' || (!savedTheme && prefersDark)
  document.documentElement.classList.toggle('dark', isDark.value)
})

// Close notifications when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.relative')) {
    showNotifications.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>