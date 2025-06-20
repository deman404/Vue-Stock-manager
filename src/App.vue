<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <template v-if="authStore.isAuthenticated">
      <AppSidebar />
      <div class="lg:pl-64">
        <AppHeader />
        <main class="p-6">
          <router-view />
        </main>
      </div>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useProductsStore } from "@/stores/products";
import { useOrdersStore } from "@/stores/orders";
import { useDashboardStore } from "@/stores/dashboard";
import AppSidebar from "@/components/AppSidebar.vue";
import AppHeader from "@/components/AppHeader.vue";

const authStore = useAuthStore();
const productsStore = useProductsStore();
const ordersStore = useOrdersStore();
const dashboardStore = useDashboardStore();

// وظيفة تحميل البيانات الأساسية بعد تسجيل الدخول
const loadUserData = () => {
  productsStore.fetchProducts();
  ordersStore.fetchOrders();
  setTimeout(() => {
    dashboardStore.generateAlerts();
  }, 1000);
};

onMounted(async () => {
  await authStore.init();
  if (authStore.isAuthenticated) {
    loadUserData();
  }
});

// تابع المتغير isAuthenticated لتحديث البيانات عند التغيير
watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth) {
      loadUserData();
    }
  }
);
</script>
