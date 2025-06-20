<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1
          class="text-2xl font-bold text-gray-900 dark:text-white"
          v-if="haveAccess"
        >
          Gestion des Produits
        </h1>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Acheter des produits
        </h1>
        <p
          class="mt-1 text-sm text-gray-500 dark:text-gray-400"
          v-if="haveAccess"
        >
          Gérez votre catalogue de produits et suivez les stocks
        </p>
      </div>
      <button
        @click="showAddModal = true"
        class="btn btn-primary mt-4 sm:mt-0"
        v-if="haveAccess"
      >
        <PlusIcon class="w-5 h-5 mr-2" />
        Nouveau Produit
      </button>
    </div>

    <!-- Filters and Search -->
    <div class="card p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un produit..."
            class="input-field"
          />
        </div>

        <div>
          <select v-model="stockFilter" class="input-field">
            <option value="">Tous les stocks</option>
            <option value="low">Stock faible</option>
            <option value="out">Rupture de stock</option>
            <option value="available">En stock</option>
          </select>
        </div>
        <div>
          <select v-model="sortBy" class="input-field">
            <option value="name">Nom</option>
            <option value="stock">Stock</option>
            <option value="price">Prix</option>
            <option value="createdAt">Date de création</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Products Grid -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="card overflow-hidden hover:shadow-lg transition-shadow animate-slide-up"
      >
        <div class="aspect-w-16 aspect-h-9">
          <img
            :src="
              product.image ||
              'https://images.pexels.com/photos/163117/pexels-photo-163117.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
            "
            :alt="product.name"
            class="w-full h-48 object-cover"
          />
        </div>

        <div class="p-4">
          <div class="flex items-start justify-between mb-2">
            <h3
              class="text-lg font-semibold text-gray-900 dark:text-white truncate"
            >
              {{ product.name }}
            </h3>
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              :class="getStockBadgeClass(product)"
            >
              {{ getStockStatus(product) }}
            </span>
          </div>

          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {{ product.description }}
          </p>

          <div class="space-y-2 mb-4">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Stock:</span
              >
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                product.stock
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Prix:</span
              >
              <span
                class="text-lg font-bold text-primary-600 dark:text-primary-400"
              >
                {{ formatCurrency(product.price) }}
              </span>
            </div>
          </div>

          <div class="flex space-x-2">
            <button
              @click="editProduct(product)"
              v-if="haveAccess"
              class="btn btn-secondary flex-1 text-sm"
            >
              <PencilIcon class="w-4 h-4 mr-1" />
              Modifier
            </button>
            <button
              @click="showStockModal(product)"
              v-if="haveAccess"
              class="btn btn-primary flex-1 text-sm"
            >
              <CubeIcon class="w-4 h-4 mr-1" />
              Stock
            </button>
            <button
              @click="showStockModal(product)"
              class="btn btn-primary flex-1 text-sm"
            >
              <CubeIcon class="w-4 h-4 mr-1" />
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="filteredProducts.length === 0" class="text-center py-12">
      <CubeIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Aucun produit trouvé
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        Aucun produit ne correspond à vos critères de recherche.
      </p>
      <button @click="resetFilters" class="btn btn-secondary">
        Réinitialiser les filtres
      </button>
    </div>

    <!-- Add/Edit Product Modal -->
    <div
      v-if="showAddModal || editingProduct"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ editingProduct ? "Modifier le produit" : "Nouveau produit" }}
          </h2>
        </div>

        <form @submit.prevent="saveProduct" class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nom du produit
              </label>
              <input
                v-model="productForm.name"
                type="text"
                required
                class="input-field mt-1"
              />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Prix de vente (€)
              </label>
              <input
                v-model.number="productForm.price"
                type="number"
                step="0.01"
                min="0"
                required
                class="input-field mt-1"
              />
            </div>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description
            </label>
            <textarea
              v-model="productForm.description"
              rows="3"
              class="input-field mt-1"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary">
              {{ editingProduct ? "Mettre à jour" : "Créer" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div
      v-if="stockModalProduct"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Ajuster le stock
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ stockModalProduct.name }}
          </p>
        </div>

        <form @submit.prevent="updateProduct" class="p-6 space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Stock actuel: {{ stockModalProduct.stock }}
            </label>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Type de mouvement
            </label>
            <select v-model="stockForm.type" class="input-field mt-1" required>
              <option value="in">Entrée de stock</option>
              <option value="out">Sortie de stock</option>
              <option value="adjustment">Ajustement</option>
            </select>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {{
                stockForm.type === "adjustment" ? "Nouveau stock" : "Quantité"
              }}
            </label>
            <input
              v-model.number="stockForm.quantity"
              type="number"
              min="0"
              required
              class="input-field mt-1"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Raison
            </label>
            <input
              v-model="stockForm.reason"
              type="text"
              required
              placeholder="Ex: Réception commande, Inventaire, etc."
              class="input-field mt-1"
            />
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="stockModalProduct = null"
              class="btn btn-secondary"
            >
              Annuler
            </button>
            <button type="submit" class="btn btn-primary">Confirmer</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue";
import type { Product } from "@/types";
import { useProductsStore } from "@/stores/products";
import { useAdminStore } from "@/stores/admin";

// State
const searchQuery = ref("");
const stockFilter = ref("");
const sortBy = ref("name");
const showAddModal = ref(false);
const editingProduct = ref<Product | null>(null);
const stockModalProduct = ref<Product | null>(null);
const userRole = localStorage.getItem("role") || "";

const haveAccess = computed(() => userRole === "admin");

// ✅ استخدم المتجر المناسب حسب الدور
const productStore = userRole === "admin" ? useAdminStore() : useProductsStore();

// Formulaires
const productForm = reactive<Partial<Product>>({
  name: "",
  description: "",
  price: 0,
  stock: 0,
  image: "",
});

const stockForm = reactive({
  type: "in" as "in" | "out" | "adjustment",
  quantity: 0,
  reason: "",
});

const filteredProducts = computed(() => {
  let filtered = [...productStore.fetchProducts()];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );
  }

  if (stockFilter.value) {
    switch (stockFilter.value) {
      case "low":
        filtered = filtered.filter(
          (product) => product.stock > 0 && product.stock <= 5
        );
        break;
      case "out":
        filtered = filtered.filter((product) => product.stock === 0);
        break;
      case "available":
        filtered = filtered.filter((product) => product.stock > 5);
        break;
    }
  }

  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case "name":
        return a.name.localeCompare(b.name);
      case "stock":
        return b.stock - a.stock;
      case "price":
        return b.price - a.price;
      case "createdAt":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
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

const getStockStatus = (product: Product) => {
  if (product.stock === 0) return "Rupture";
  if (product.stock <= 5) return "Faible";
  return "En stock";
};

const getStockBadgeClass = (product: Product) => {
  if (product.stock === 0) {
    return "bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400";
  }
  if (product.stock <= 5) {
    return "bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400";
  }
  return "bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400";
};

const resetFilters = () => {
  searchQuery.value = "";
  stockFilter.value = "";
  sortBy.value = "name";
};

const resetForm = () => {
  Object.assign(productForm, {
    name: "",
    description: "",
    price: 0,
    stock: 0,
    image: "",
  });
};

const editProduct = (product: Product) => {
  editingProduct.value = product;
  Object.assign(productForm, {
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    image: product.image || "",
  });
  showAddModal.value = true;
};

const closeModal = () => {
  showAddModal.value = false;
  editingProduct.value = null;
  resetForm();
};

const saveProduct = async () => {
  try {
    if (editingProduct.value) {
      await productStore.updateProduct(editingProduct.value.id, {
        ...productForm,
      });
    } else {
      await productStore.createProduct(productForm as Product);
    }
    closeModal();
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du produit", error);
  }
};

const showStockModal = (product: Product) => {
  stockModalProduct.value = product;
  stockForm.type = "in";
  stockForm.quantity = 0;
  stockForm.reason = "";
};

const updateProduct = async () => {
  if (!stockModalProduct.value) return;

  try {
    await productStore.updateProduct(stockModalProduct.value.id, {
      stock:
        stockForm.type === "adjustment"
          ? stockForm.quantity
          : stockModalProduct.value.stock +
            (stockForm.type === "in"
              ? stockForm.quantity
              : -stockForm.quantity),
    });
    stockModalProduct.value = null;
  } catch (error) {
    console.error("Erreur lors de l’ajustement du stock", error);
  }
};

onMounted(() => {
  productStore.fetchProducts();
});
</script>

