<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Welcome section -->
    <div
      class="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white"
    >
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">
            Bonjour, {{ authStore.user?.name }} 👋
          </h1>
          <p class="text-primary-100 mt-1">
            Voici un aperçu de votre activité aujourd'hui
          </p>
        </div>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="stat in statsCards"
        :key="stat.title"
        class="card p-6 hover:shadow-md transition-shadow animate-slide-up"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              {{ stat.title }}
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {{ stat.value }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ stat.subtitle }}
            </p>
          </div>
          <div class="p-3 rounded-full" :class="stat.bgColor">
            <component
              :is="stat.icon"
              class="w-6 h-6"
              :class="stat.iconColor"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Users -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Utilisateurs récents
          </h3>
          <router-link
            to="/admin/users"
            class="text-sm text-primary-600 hover:text-primary-700"
          >
            Voir tous
          </router-link>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th
                  class="text-left py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                >
                  Nom
                </th>
                <th
                  class="text-left py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                >
                  Email
                </th>
                <th
                  class="text-left py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                >
                  Rôle
                </th>
                <th
                  class="text-right py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="user in recentUsers"
                :key="user.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td class="py-4">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ user.name }}
                  </p>
                </td>
                <td class="py-4">
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ user.email }}
                  </p>
                </td>
                <td class="py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getRoleBadgeClass(getRoleLabel(user.roles[0]))"
                  >
                    {{ getRoleLabel(user.roles[0]) }}
                  </span>
                </td>
                <td class="py-4 text-right">
                  <button
                    v-if="
                      getRoleLabel(user.roles[0]) !== 'delivery' &&
                      getRoleLabel(user.roles[0]) !== 'admin'
                    "
                    @click="assignDeliveryRole(user.id)"
                    class="text-xs bg-primary-500 hover:bg-primary-600 text-white px-2 py-1 rounded mr-2"
                  >
                    Livreur
                  </button>
                  <button
                    v-if="getRoleLabel(user.roles[0]) === 'delivery'"
                    @click="removeDeliveryRole(user.id)"
                    class="text-xs bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded mr-2"
                  >
                    Retirer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Actions rapides
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <router-link
            to="/admin/users/create"
            class="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <div
                class="p-2 rounded-full bg-primary-100 dark:bg-primary-900/20"
              >
                <UserPlusIcon
                  class="w-5 h-5 text-primary-600 dark:text-primary-400"
                />
              </div>
              <span class="text-sm font-medium">Ajouter utilisateur</span>
            </div>
          </router-link>
          <router-link
            to="/products/create"
            class="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <div
                class="p-2 rounded-full bg-success-100 dark:bg-success-900/20"
              >
                <PlusCircleIcon
                  class="w-5 h-5 text-success-600 dark:text-success-400"
                />
              </div>
              <span class="text-sm font-medium">Ajouter produit</span>
            </div>
          </router-link>
          <router-link
            to="/orders"
            class="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <div
                class="p-2 rounded-full bg-warning-100 dark:bg-warning-900/20"
              >
                <ClipboardDocumentListIcon
                  class="w-5 h-5 text-warning-600 dark:text-warning-400"
                />
              </div>
              <span class="text-sm font-medium">Gérer commandes</span>
            </div>
          </router-link>
          <router-link
            to="/admin/settings"
            class="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <div class="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <Cog6ToothIcon
                  class="w-5 h-5 text-purple-600 dark:text-purple-400"
                />
              </div>
              <span class="text-sm font-medium">Paramètres</span>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Orders -->
      <div class="lg:col-span-2 card p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Commandes récentes
          </h3>
          <router-link
            to="/orders"
            class="text-sm text-primary-600 hover:text-primary-700"
          >
            Voir toutes
          </router-link>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th
                  class="text-left py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                >
                  Commande
                </th>
                <th
                  class="text-left py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                >
                  Client
                </th>
                <th
                  class="text-left py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                >
                  Statut
                </th>
                <th
                  class="text-right py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="order in recentOrders"
                :key="order.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td class="py-4">
                  <div>
                    <p
                      class="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {{ order.orderNumber }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ formatDate(order.createdAt) }}
                    </p>
                  </div>
                </td>
                <td class="py-4">
                  <p class="text-sm text-gray-900 dark:text-white">
                    {{ getClientName(order.clientId) }}
                  </p>
                </td>
                <td class="py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusBadgeClass(order.status)"
                  >
                    {{ getStatusLabel(order.status) }}
                  </span>
                </td>
                <td class="py-4 text-right">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ formatCurrency(order.total) }}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Order Status Chart -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useAdminStore } from "@/stores/admin";
import { useProductsStore } from "@/stores/products";
import { useOrdersStore } from "@/stores/orders";
import { useDashboardStore } from "@/stores/dashboard";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  CubeIcon,
  ShoppingCartIcon,
  UsersIcon,
  CurrencyEuroIcon,
  UserPlusIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
} from "@heroicons/vue/24/outline";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const authStore = useAuthStore();
const adminStore = useAdminStore();
const productsStore = useProductsStore();
const ordersStore = useOrdersStore();
const dashboardStore = useDashboardStore();

const currentTime = ref("");
const currentDate = ref("");

// Fetch data on mount
onMounted(async () => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);

  await Promise.all([
    productsStore.fetchProducts(),
    ordersStore.fetchOrders(),
    adminStore.fetchAllUsers(),
    dashboardStore.fetchStats(),
  ]);
});

const statsCards = computed(() => [
  {
    title: "Total Produits",
    value: dashboardStore.stats.totalProducts.toString(),
    subtitle: `${productsStore.lowStockProducts.length} en stock faible`,
    icon: CubeIcon,
    bgColor: "bg-primary-100 dark:bg-primary-900/20",
    iconColor: "text-primary-600 dark:text-primary-400",
  },
  {
    title: "Commandes",
    value: dashboardStore.stats.totalOrders.toString(),
    subtitle: `${dashboardStore.stats.pendingOrders} en attente`,
    icon: ShoppingCartIcon,
    bgColor: "bg-success-100 dark:bg-success-900/20",
    iconColor: "text-success-600 dark:text-success-400",
  },
  {
    title: "Utilisateurs",
    value: dashboardStore.stats.totalUsers.toString(),
    subtitle: `${dashboardStore.stats.deliveryUsers} livreurs`,
    icon: UsersIcon,
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    title: "Revenus",
    value: formatCurrency(dashboardStore.stats.totalRevenue),
    subtitle: `ce mois`,
    icon: CurrencyEuroIcon,
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
]);

const recentOrders = computed(() => ordersStore.orders.slice(0, 5));

const recentUsers = computed(() => adminStore.users.slice(0, 5));

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

const formatDate = (date: Date) => {
  return format(date, "dd MMM yyyy", { locale: fr });
};

const getClientName = (clientId?: string) => {
  if (!clientId) return "Client inconnu";
  const client = adminStore.users.find((user) => user.id === clientId);
  if (client) {
    return client.name || "Client sans nom";
  }
  console.warn(`Client with ID ${clientId} not found`);
  return clientId;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "En attente",
    confirmed: "Confirmée",
    processing: "En traitement",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
  };
  return labels[status] || status;
};

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    pending:
      "bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400",
    confirmed:
      "bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400",
    processing:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    shipped:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    delivered:
      "bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400",
    cancelled:
      "bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
};

const getRoleLabel = (role?: string) => {
  const labels: Record<string, string> = {
    admin: "Administrateur",
    delivery: "Livreur",
    user: "Utilisateur",
  };
  return labels[role || "user"] || role || "Utilisateur";
};

const getRoleBadgeClass = (role?: string) => {
  const classes: Record<string, string> = {
    admin:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    delivery:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    user: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };
  return classes[role || "user"] || "bg-gray-100 text-gray-800";
};

const assignDeliveryRole = async (userId: string) => {
  try {
    await adminStore.assignDeliveryRole(userId);
  } catch (error) {
    console.error("Error assigning delivery role:", error);
  }
};

const removeDeliveryRole = async (userId: string) => {
  try {
    await adminStore.removeDeliveryRole(userId);
  } catch (error) {
    console.error("Error removing delivery role:", error);
  }
};

const updateTime = () => {
  const now = new Date();
  currentTime.value = format(now, "HH:mm:ss");
  currentDate.value = format(now, "EEEE dd MMMM yyyy", { locale: fr });
};

let timeInterval: number;

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>
