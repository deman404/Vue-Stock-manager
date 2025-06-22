<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des Commandes
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez vos commandes clients et fournisseurs
        </p>
      </div>
      <router-link to="/orders/new" class="btn btn-primary mt-4 sm:mt-0">
        <PlusIcon class="w-5 h-5 mr-2" />
        Nouvelle Commande
      </router-link>
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
          />
        </div>
        <div>
          <select v-model="selectedType" class="input-field">
            <option value="">Tous les types</option>
            <option value="vente">Ventes</option>
            <option value="achat">Achats</option>
          </select>
        </div>
        <div>
          <select v-model="selectedStatus" class="input-field">
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmée</option>
            <option value="processing">En traitement</option>
            <option value="shipped">Expédiée</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>
        <div>
          <select v-model="sortBy" class="input-field">
            <option value="createdAt">Date de création</option>
            <option value="total">Montant</option>
            <option value="orderNumber">Numéro</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Commande
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Client/Fournisseur
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Statut
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Total
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
          >
            <tr
              v-for="order in filteredOrders"
              :key="order.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div
                    class="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {{ order.orderNumber }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ order.items.length }} article(s)
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="
                    order.type === 'vente'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                  "
                >
                  {{ order.type === "vente" ? "Vente" : "Achat" }}
                </span>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
              >
                {{ getOrderClient(order) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusBadgeClass(order.status)"
                >
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
              >
                {{ formatCurrency(order.total) }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
              >
                {{ formatDate(order.createdAt) }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
              >
                <div class="flex justify-end space-x-2">
                  <button
                    @click="updateStatus(order)"
                    class="text-primary-600 hover:text-primary-900 dark:text-primary-400"
                  >
                    Modifier
                  </button>
                  <button
                    @click="viewOrder(order)"
                    class="text-gray-600 hover:text-gray-900 dark:text-gray-400"
                  >
                    Voir
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="filteredOrders.length === 0" class="text-center py-12">
      <ShoppingCartIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Aucune commande trouvée
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        Aucune commande ne correspond à vos critères de recherche.
      </p>
      <router-link to="/orders/new" class="btn btn-primary">
        Créer une nouvelle commande
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useOrdersStore } from "@/stores/orders";
import { useAdminStore } from "@/stores/admin";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Order } from "@/types";
import { PlusIcon, ShoppingCartIcon } from "@heroicons/vue/24/outline";

const role = localStorage.getItem("role");
const ordersStore =
  role === "admin"
    ? useAdminStore()
    : role === "delivery"
    ? useAdminStore()
    : useOrdersStore();

onMounted(() => {
  if (role === "admin") {
    ordersStore.fetchAllOrders && ordersStore.fetchAllOrders();
  } else if (role === "delivery") {
    ordersStore.fetchDeliveryOrders && ordersStore.fetchDeliveryOrders();
  } else {
    ordersStore.fetchOrders && ordersStore.fetchOrders();
  }
});

const searchQuery = ref("");
const selectedType = ref("");
const selectedStatus = ref("");
const sortBy = ref("createdAt");

const filteredOrders = computed(() => {
  let filtered = [...ordersStore.orders];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(query) ||
        getOrderClient(order).toLowerCase().includes(query)
    );
  }

  if (selectedType.value) {
    filtered = filtered.filter((order) => order.type === selectedType.value);
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(
      (order) => order.status === selectedStatus.value
    );
  }

  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case "createdAt":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "total":
        return b.total - a.total;
      case "orderNumber":
        return a.orderNumber.localeCompare(b.orderNumber);
      default:
        return 0;
    }
  });

  return filtered;
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

const formatDate = (date: Date) => {
  return format(date, "dd MMM yyyy", { locale: fr });
};

const getOrderClient = (order: Order) => {
  if (order.type === "vente" && order.clientId) {
    const clients = (ordersStore as any).clients ?? [];
    const client = clients.find((c: any) => c.id === order.clientId);
    return client?.name || "Client inconnu";
  } else if (order.type === "achat" && order.supplierId) {
    const suppliers = (ordersStore as any).suppliers ?? [];
    const supplier = suppliers.find((s: any) => s.id === order.supplierId);
    return supplier?.name || "Fournisseur inconnu";
  }
  return "Non défini";
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

const updateStatus = (order: Order) => {
  if (role === "admin" && ordersStore.updateOrderStatus) {
    ordersStore
      .updateOrderStatus(order.id, "confirmed")
      .then(() => {
        // Optionally show a notification
      })
      .catch((err: any) => {
        console.error("Erreur lors de la mise à jour du statut :", err);
      });
  } else if (role === "delivery" && ordersStore.takeOrder) {
    ordersStore
      .takeOrder(order.id)
      .then(() => {
        // Optionally show a notification
      })
      .catch((err: any) => {
        console.error("Erreur lors de la prise de commande :", err);
      });
  } else {
    console.log("Update status for order:", order.id);
  }
};

const viewOrder = async (order: Order) => {
  if (role === "admin" && ordersStore.getOrderById) {
    try {
      const orderDetails = await ordersStore.getOrderById(order.id);
      // Show order details in a modal or route
      console.log("Order details:", orderDetails);
    } catch (err) {
      console.error("Erreur lors de la récupération de la commande :", err);
    }
  } else {
    console.log("View order:", order.id);
  }
};
</script>
