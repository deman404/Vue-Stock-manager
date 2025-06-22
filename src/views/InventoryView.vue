<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion de l'Inventaire
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Suivez les mouvements de stock et gérez l'inventaire
        </p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Produits
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {{ productsStore.products.length }}
            </p>
          </div>
          <div class="p-3 rounded-full bg-primary-100 dark:bg-primary-900/20">
            <CubeIcon class="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Stock Faible
            </p>
            <p
              class="text-2xl font-bold text-warning-600 dark:text-warning-400 mt-2"
            >
              {{ productsStore.lowStockProducts.length }}
            </p>
          </div>
          <div class="p-3 rounded-full bg-warning-100 dark:bg-warning-900/20">
            <ExclamationTriangleIcon
              class="w-6 h-6 text-warning-600 dark:text-warning-400"
            />
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Rupture de Stock
            </p>
            <p
              class="text-2xl font-bold text-error-600 dark:text-error-400 mt-2"
            >
              {{ productsStore.outOfStockProducts.length }}
            </p>
          </div>
          <div class="p-3 rounded-full bg-error-100 dark:bg-error-900/20">
            <XCircleIcon class="w-6 h-6 text-error-600 dark:text-error-400" />
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Valeur Stock
            </p>
            <p
              class="text-2xl font-bold text-success-600 dark:text-success-400 mt-2"
            >
              {{ formatCurrency(totalStockValue) }}
            </p>
          </div>
          <div class="p-3 rounded-full bg-success-100 dark:bg-success-900/20">
            <CurrencyEuroIcon
              class="w-6 h-6 text-success-600 dark:text-success-400"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Stock Alerts -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Alertes de Stock
        </h2>
        <div class="space-y-4 max-h-96 overflow-y-auto">
          <div
            v-for="product in stockAlerts"
            :key="product.id"
            class="flex items-center space-x-4 p-4 rounded-lg"
            :class="
              product.stock === 0
                ? 'bg-error-50 dark:bg-error-900/20'
                : 'bg-warning-50 dark:bg-warning-900/20'
            "
          >
            <img
              :src="
                product.image ||
                'https://images.pexels.com/photos/163117/pexels-photo-163117.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
              "
              :alt="product.name"
              class="w-12 h-12 rounded-lg object-cover"
            />
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-medium text-gray-900 dark:text-white truncate"
              >
                {{ product.name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Stock: {{ product.stock }} / Min: {{ product.minStock ?? 5 }}
              </p>
            </div>
            <div class="flex-shrink-0">
              <span
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                :class="
                  product.stock === 0
                    ? 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400'
                    : 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400'
                "
              >
                {{ product.stock === 0 ? "Rupture" : "Faible" }}
              </span>
            </div>
          </div>
          <div v-if="stockAlerts.length === 0" class="text-center py-8">
            <CheckCircleIcon class="w-12 h-12 text-success-500 mx-auto mb-3" />
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Aucune alerte de stock
            </p>
          </div>
        </div>
      </div>

      <!-- Recent Stock Movements -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Mouvements Récents
        </h2>
        <div class="space-y-4 max-h-96 overflow-y-auto">
          <div
            v-for="movement in recentMovements"
            :key="movement.id"
            class="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div class="flex-shrink-0">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center"
                :class="getMovementIconClass(movement.type)"
              >
                <ArrowUpIcon v-if="movement.type === 'in'" class="w-5 h-5" />
                <ArrowDownIcon
                  v-else-if="movement.type === 'out'"
                  class="w-5 h-5"
                />
                <AdjustmentsHorizontalIcon v-else class="w-5 h-5" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-medium text-gray-900 dark:text-white truncate"
              >
                {{ movement.product?.name ?? "Produit inconnu" }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ movement.reason ?? "" }}
              </p>
              <p class="text-xs text-gray-400">
                {{ movement.createdAt ? formatDate(movement.createdAt) : "" }}
              </p>
            </div>
            <div class="text-right">
              <p
                class="text-sm font-medium"
                :class="
                  movement.type === 'in'
                    ? 'text-success-600'
                    : movement.type === 'out'
                    ? 'text-error-600'
                    : 'text-primary-600'
                "
              >
                {{
                  movement.type === "in"
                    ? "+"
                    : movement.type === "out"
                    ? "-"
                    : ""
                }}{{ movement.quantity ?? "" }}
              </p>
            </div>
          </div>
          <div v-if="recentMovements.length === 0" class="text-center py-8">
            <ClockIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Aucun mouvement récent
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Products Table -->
    <div class="card overflow-hidden">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            État des Stocks
          </h2>
          <div class="mt-4 sm:mt-0 flex space-x-2">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher..."
              class="input-field"
            />
            <select v-model="stockFilter" class="input-field">
              <option value="">Tous</option>
              <option value="low">Stock faible</option>
              <option value="out">Rupture</option>
              <option value="ok">Stock OK</option>
            </select>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Produit
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                SKU
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Stock Actuel
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Stock Min/Max
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Valeur
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Statut
              </th>
            </tr>
          </thead>
          <tbody
            class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
          >
            <tr
              v-for="product in filteredProducts"
              :key="product.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    :src="
                      product.image ||
                      'https://images.pexels.com/photos/163117/pexels-photo-163117.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
                    "
                    :alt="product.name"
                    class="w-10 h-10 rounded-lg object-cover mr-3"
                  />
                  <div>
                    <div
                      class="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {{ product.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ product.category ?? "-" }}
                    </div>
                  </div>
                </div>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white"
              >
                {{ product.sku ?? "-" }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ product.stock }}
                </div>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
              >
                {{ product.minStock ?? 5 }} / {{ product.maxStock ?? "-" }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
              >
                {{
                  formatCurrency(
                    (product.stock ?? 0) * (product.cost ?? product.price ?? 0)
                  )
                }}
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
import { ref, computed } from "vue";
import { useProductsStore } from "@/stores/products";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Product } from "@/types";
import {
  CubeIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CurrencyEuroIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/vue/24/outline";

const productsStore = useProductsStore();

const searchQuery = ref("");
const stockFilter = ref("");

// Defensive: fallback to 5 for minStock if not present
const stockAlerts = computed(() => [
  ...productsStore.outOfStockProducts,
  ...productsStore.lowStockProducts,
]);

// Defensive: stockMovements may be empty, so fallback to []
const recentMovements = computed(() =>
  Array.isArray(productsStore.stockMovements)
    ? productsStore.stockMovements.slice(0, 10)
    : []
);

const totalStockValue = computed(() =>
  productsStore.products.reduce(
    (total, product) =>
      total + (product.stock ?? 0) * (product.cost ?? product.price ?? 0),
    0
  )
);

const filteredProducts = computed(() => {
  let filtered = [...productsStore.products];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        (product.sku?.toLowerCase?.() ?? "").includes(query) ||
        (product.category?.toLowerCase?.() ?? "").includes(query)
    );
  }

  // Stock filter
  if (stockFilter.value) {
    switch (stockFilter.value) {
      case "low":
        filtered = filtered.filter(
          (product) =>
            (product.stock ?? 0) <= (product.minStock ?? 5) &&
            (product.stock ?? 0) > 0
        );
        break;
      case "out":
        filtered = filtered.filter((product) => (product.stock ?? 0) === 0);
        break;
      case "ok":
        filtered = filtered.filter(
          (product) => (product.stock ?? 0) > (product.minStock ?? 5)
        );
        break;
    }
  }

  return filtered;
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

const formatDate = (date: Date | string) => {
  if (!date) return "";
  return format(new Date(date), "dd MMM yyyy à HH:mm", { locale: fr });
};

const getStockStatus = (product: any) => {
  if ((product.stock ?? 0) === 0) return "Rupture";
  if ((product.stock ?? 0) <= (product.minStock ?? 5)) return "Faible";
  return "En stock";
};

const getStockBadgeClass = (product: any) => {
  if ((product.stock ?? 0) === 0) {
    return "bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400";
  }
  if ((product.stock ?? 0) <= (product.minStock ?? 5)) {
    return "bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400";
  }
  return "bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400";
};

const getMovementIconClass = (type: string) => {
  switch (type) {
    case "in":
      return "bg-success-100 text-success-600 dark:bg-success-900/20 dark:text-success-400";
    case "out":
      return "bg-error-100 text-error-600 dark:bg-error-900/20 dark:text-error-400";
    default:
      return "bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400";
  }
};
</script>
