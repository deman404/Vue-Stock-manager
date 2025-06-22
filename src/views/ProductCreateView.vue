<template>
  <div class="p-8 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Créer une commande</h1>
    <form @submit.prevent="submitOrder">
      <div class="mb-4">
        <label class="block mb-1 font-medium">Type de commande</label>
        <select v-model="orderType" class="input-field" required>
          <option value="vente">Vente (Client)</option>
          <option value="achat">Achat (Fournisseur)</option>
        </select>
      </div>
      <div class="mb-4" v-if="orderType === 'vente'">
        <label class="block mb-1 font-medium">Client</label>
        <select v-model="selectedClient" class="input-field" required>
          <option value="">Sélectionner un client</option>
          <option
            v-for="client in adminStore.clients"
            :key="client.id"
            :value="client.id"
          >
            {{ client.name }} ({{ client.email }})
          </option>
        </select>
        <div v-if="clientsLoading" class="text-xs text-gray-500 mt-1">
          Chargement des clients...
        </div>
        <div
          v-else-if="adminStore.clients.length === 0"
          class="text-xs text-red-500 mt-1"
        >
          Aucun client trouvé.
        </div>
      </div>
      <div class="mb-4" v-if="orderType === 'achat'">
        <label class="block mb-1 font-medium">Fournisseur</label>
        <select v-model="selectedSupplier" class="input-field" required>
          <option value="">Sélectionner un fournisseur</option>
          <option
            v-for="supplier in adminStore.suppliers"
            :key="supplier.id"
            :value="supplier.id"
          >
            {{ supplier.name }} ({{ supplier.email }})
          </option>
        </select>
      </div>
      <!-- Add your order items/products selection here -->
      <button type="submit" class="btn btn-primary mt-4">
        Créer la commande
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAdminStore } from "@/stores/admin";

const adminStore = useAdminStore();
const orderType = ref("vente");
const selectedClient = ref("");
const selectedSupplier = ref("");
const clientsLoading = ref(true);

onMounted(async () => {
  clientsLoading.value = true;
  await adminStore.fetchClients();
  await adminStore.fetchSuppliers();
  clientsLoading.value = false;
});

const submitOrder = async () => {
  // Build orderData according to your backend API
  const orderData: any = {
    type: orderType.value,
    clientId: orderType.value === "vente" ? selectedClient.value : undefined,
    supplierId:
      orderType.value === "achat" ? selectedSupplier.value : undefined,
    // Add items/products here
  };
  try {
    await adminStore.createOrder(orderData);
    // Redirect or show success
  } catch (err) {
    // Handle error
  }
};
</script>
