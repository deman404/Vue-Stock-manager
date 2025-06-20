<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Mon Profil
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez vos informations personnelles et préférences
        </p>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Card -->
      <div class="lg:col-span-1">
        <div class="card p-6 text-center">
          <div class="mb-4" v-if="isAuthenticated">
            <img
              :src="
                authStore.user?.avatar ||
                'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
              "
              :alt="authStore.user?.name"
              class="w-24 h-24 rounded-full object-cover mx-auto mb-4"
            />
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ authStore.user?.name }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {{ userRole }}
            </p>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex items-center justify-center space-x-2">
              <EnvelopeIcon class="w-4 h-4 text-gray-400" />
              <span class="text-gray-600 dark:text-gray-300">{{
                authStore.user?.email
              }}</span>
            </div>
          </div>

          <button
            @click="showEditModal = true"
            class="btn btn-primary w-full mt-6"
          >
            <PencilIcon class="w-4 h-4 mr-2" />
            Modifier le profil
          </button>
        </div>
      </div>

      <!-- Profile Details -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Account Information -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informations du compte
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nom complet
              </label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ authStore.user?.name }}
              </p>
            </div>
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Adresse email
              </label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ authStore.user?.email }}
              </p>
            </div>
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Rôle
              </label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                {{ userRole || "Utilisateur" }}
              </p>
            </div>
          </div>
        </div>

        <!-- Activity Stats -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Statistiques d'activité
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              class="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
            >
              <div
                class="text-2xl font-bold text-primary-600 dark:text-primary-400"
              >
                {{ userStats.totalOrders }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Commandes créées
              </div>
            </div>
            <div
              class="text-center p-4 bg-success-50 dark:bg-success-900/20 rounded-lg"
            >
              <div
                class="text-2xl font-bold text-success-600 dark:text-success-400"
              >
                {{ userStats.totalProducts }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Produits gérés
              </div>
            </div>
            <div
              class="text-center p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg"
            >
              <div
                class="text-2xl font-bold text-warning-600 dark:text-warning-400"
              >
                {{ userStats.loginCount }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Connexions
              </div>
            </div>
          </div>
        </div>

        <!-- Preferences -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Préférences
          </h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <label
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Notifications par email
                </label>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Recevoir des notifications pour les alertes importantes
                </p>
              </div>
              <input
                v-model="preferences.emailNotifications"
                type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Alertes de stock
                </label>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Être notifié en cas de stock faible
                </p>
              </div>
              <input
                v-model="preferences.stockAlerts"
                type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Rapports automatiques
                </label>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Recevoir des rapports hebdomadaires par email
                </p>
              </div>
              <input
                v-model="preferences.weeklyReports"
                type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>

          <div class="mt-6">
            <button @click="savePreferences" class="btn btn-primary">
              Sauvegarder les préférences
            </button>
          </div>
        </div>

        <!-- Security -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sécurité
          </h3>
          <div class="space-y-4">
            <button @click="showPasswordModal = true" class="btn btn-secondary">
              <KeyIcon class="w-4 h-4 mr-2" />
              Changer le mot de passe
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Modifier le profil
          </h2>
        </div>

        <form @submit.prevent="saveProfile" class="p-6 space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nom complet
            </label>
            <input
              v-model="profileForm.name"
              type="text"
              required
              class="input-field mt-1"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              v-model="profileForm.email"
              type="email"
              required
              class="input-field mt-1"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              URL de l'avatar
            </label>
            <input
              v-model="profileForm.avatar"
              type="url"
              class="input-field mt-1"
            />
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="showEditModal = false"
              class="btn btn-secondary"
            >
              Annuler
            </button>
            <button type="submit" class="btn btn-primary">Sauvegarder</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div
      v-if="showPasswordModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Changer le mot de passe
          </h2>
        </div>

        <form @submit.prevent="changePassword" class="p-6 space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Mot de passe actuel
            </label>
            <input
              v-model="passwordForm.current"
              type="password"
              required
              class="input-field mt-1"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nouveau mot de passe
            </label>
            <input
              v-model="passwordForm.new"
              type="password"
              required
              class="input-field mt-1"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirmer le nouveau mot de passe
            </label>
            <input
              v-model="passwordForm.confirm"
              type="password"
              required
              class="input-field mt-1"
            />
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="showPasswordModal = false"
              class="btn btn-secondary"
            >
              Annuler
            </button>
            <button type="submit" class="btn btn-primary">Changer</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useOrdersStore } from "@/stores/orders";
import { useProductsStore } from "@/stores/products";
import { PencilIcon, EnvelopeIcon, KeyIcon } from "@heroicons/vue/24/outline";

const authStore = useAuthStore();
const ordersStore = useOrdersStore();
const productsStore = useProductsStore();
const userRole = localStorage.getItem("role") || "";

const showEditModal = ref(false);
const showPasswordModal = ref(false);
const isAuthenticated = !!authStore.user;

const profileForm = reactive({
  name: authStore.user?.name || "",
  email: authStore.user?.email || "",
  avatar: authStore.user?.avatar || "",
});

const passwordForm = reactive({
  current: "",
  new: "",
  confirm: "",
});

const preferences = reactive({
  emailNotifications: true,
  stockAlerts: true,
  weeklyReports: false,
});

const userStats = computed(() => {
  // Mock stats based on user role

  if (userRole === "delivery") {
    return {
      totalOrders: ordersStore.orders.filter(
        (o) => o.clientId === authStore.user?.id
      ).length,
      totalProducts: 0,
      loginCount: 42,
    };
  }

  return {
    totalOrders: ordersStore.orders.length,
    totalProducts: productsStore.products.length,
    loginCount: 156,
  };
});

const saveProfile = () => {
  // TODO: Implement profile update
  console.log("Saving profile:", profileForm);
  showEditModal.value = false;
};

const changePassword = () => {
  if (passwordForm.new !== passwordForm.confirm) {
    alert("Les mots de passe ne correspondent pas");
    return;
  }

  // TODO: Implement password change
  console.log("Changing password");
  showPasswordModal.value = false;

  // Reset form
  Object.assign(passwordForm, {
    current: "",
    new: "",
    confirm: "",
  });
};

const savePreferences = () => {
  // TODO: Implement preferences save
  console.log("Saving preferences:", preferences);
  alert("Préférences sauvegardées");
};
</script>
