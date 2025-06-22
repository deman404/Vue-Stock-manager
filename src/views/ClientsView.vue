<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des Clients
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez votre base de données clients
        </p>
      </div>
      <button @click="showAddModal = true" class="btn btn-primary mt-4 sm:mt-0">
        <PlusIcon class="w-5 h-5 mr-2" />
        Nouveau Client
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="card p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un client..."
            class="input-field"
          />
        </div>
        <div>
          <select v-model="sortBy" class="input-field">
            <option value="name">Nom</option>
            <option value="createdAt">Date de création</option>
            <option value="company">Entreprise</option>
          </select>
        </div>
        <div>
          <select v-model="filterType" class="input-field">
            <option value="">Tous les clients</option>
            <option value="company">Entreprises</option>
            <option value="individual">Particuliers</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Clients Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="client in filteredClients"
        :key="client.id"
        class="card p-6 hover:shadow-lg transition-shadow animate-slide-up"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div
              class="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center"
            >
              <UsersIcon
                class="w-6 h-6 text-primary-600 dark:text-primary-400"
              />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ client.name }}
              </h3>
              <p
                v-if="client.company"
                class="text-sm text-gray-500 dark:text-gray-400"
              >
                {{ client.company }}
              </p>
            </div>
          </div>
          <span
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            :class="
              client.company
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
            "
          >
            {{ client.company ? "Entreprise" : "Particulier" }}
          </span>
        </div>

        <div class="space-y-2 mb-4">
          <div class="flex items-center space-x-2">
            <EnvelopeIcon class="w-4 h-4 text-gray-400" />
            <span class="text-sm text-gray-600 dark:text-gray-300">{{
              client.email
            }}</span>
          </div>
          <div v-if="client.phone" class="flex items-center space-x-2">
            <PhoneIcon class="w-4 h-4 text-gray-400" />
            <span class="text-sm text-gray-600 dark:text-gray-300">{{
              client.phone
            }}</span>
          </div>
          <div v-if="client.address" class="flex items-start space-x-2">
            <MapPinIcon class="w-4 h-4 text-gray-400 mt-0.5" />
            <span class="text-sm text-gray-600 dark:text-gray-300">{{
              client.address
            }}</span>
          </div>
        </div>

        <div class="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Client depuis {{ formatDate(client.createdAt) }}
        </div>

        <div class="flex space-x-2">
          <button
            @click="editClient(client)"
            class="btn btn-secondary flex-1 text-sm"
          >
            <PencilIcon class="w-4 h-4 mr-1" />
            Modifier
          </button>
          <button
            @click="viewOrders(client)"
            class="btn btn-primary flex-1 text-sm"
          >
            <ShoppingCartIcon class="w-4 h-4 mr-1" />
            Commandes
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="filteredClients.length === 0" class="text-center py-12">
      <UsersIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Aucun client trouvé
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        Aucun client ne correspond à vos critères de recherche.
      </p>
      <button @click="resetFilters" class="btn btn-secondary">
        Réinitialiser les filtres
      </button>
    </div>

    <!-- Add/Edit Client Modal -->
    <div
      v-if="showAddModal || editingClient"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ editingClient ? "Modifier le client" : "Nouveau client" }}
          </h2>
        </div>

        <form @submit.prevent="saveClient" class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nom complet *
              </label>
              <input
                v-model="clientForm.name"
                type="text"
                required
                class="input-field mt-1"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email *
              </label>
              <input
                v-model="clientForm.email"
                type="email"
                required
                class="input-field mt-1"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Téléphone
              </label>
              <input
                v-model="clientForm.phone"
                type="tel"
                class="input-field mt-1"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Entreprise
              </label>
              <input
                v-model="clientForm.company"
                type="text"
                class="input-field mt-1"
              />
            </div>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Adresse
            </label>
            <textarea
              v-model="clientForm.address"
              rows="3"
              class="input-field mt-1"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary">
              {{ editingClient ? "Mettre à jour" : "Créer" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import { useOrdersStore } from "@/stores/orders";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Client } from "@/types";
import {
  PlusIcon,
  UsersIcon,
  PencilIcon,
  ShoppingCartIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/vue/24/outline";

const ordersStore = useOrdersStore();

const searchQuery = ref("");
const sortBy = ref("name");
const filterType = ref("");
const showAddModal = ref(false);
const editingClient = ref<Client | null>(null);

const clientForm = reactive({
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
});

const filteredClients = computed(() => {
  // Defensive: fallback to empty array if undefined
  let filtered = Array.isArray(ordersStore.clients)
    ? [...ordersStore.clients]
    : [];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        (client.company && client.company.toLowerCase().includes(query))
    );
  }

  // Type filter
  if (filterType.value) {
    if (filterType.value === "company") {
      filtered = filtered.filter((client) => client.company);
    } else if (filterType.value === "individual") {
      filtered = filtered.filter((client) => !client.company);
    }
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case "name":
        return a.name.localeCompare(b.name);
      case "createdAt":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "company":
        return (a.company || "").localeCompare(b.company || "");
      default:
        return 0;
    }
  });

  return filtered;
});

const formatDate = (date: Date) => {
  return format(date, "dd MMM yyyy", { locale: fr });
};

const resetFilters = () => {
  searchQuery.value = "";
  sortBy.value = "name";
  filterType.value = "";
};

const resetForm = () => {
  Object.assign(clientForm, {
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
  });
};

const editClient = (client: Client) => {
  editingClient.value = client;
  Object.assign(clientForm, {
    name: client.name,
    email: client.email,
    phone: client.phone || "",
    company: client.company || "",
    address: client.address || "",
  });
};

const closeModal = () => {
  showAddModal.value = false;
  editingClient.value = null;
  resetForm();
};

const saveClient = () => {
  if (editingClient.value) {
    // Update existing client (would need to implement in store)
    console.log("Update client:", editingClient.value.id, clientForm);
  } else {
    // Create new client
    ordersStore.addClient({ ...clientForm });
  }
  closeModal();
};

const viewOrders = (client: Client) => {
  // TODO: Navigate to orders filtered by client
  console.log("View orders for client:", client.id);
};
</script>
