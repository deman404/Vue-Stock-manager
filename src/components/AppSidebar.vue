<template v-if="isAuthenticated">
  <aside
    class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0"
    :class="{ '-translate-x-full': !isOpen }"
  >
    <div class="flex flex-col h-full">
      <!-- Logo -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center space-x-3">
          <div
            class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <span class="text-xl font-bold text-gray-900 dark:text-white"
            >StockFlow</span
          >
        </div>
        <button
          @click="toggleSidebar"
          class="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <template v-for="item in navigationItems" :key="item.name">
          <router-link
            v-if="hasRoleAccess(item.roles)"
            :to="item.href"
            class="sidebar-link"
            :class="{ active: $route.name === item.name }"
            @click="closeSidebarOnMobile"
          >
            <component :is="item.icon" class="w-5 h-5 mr-3" />
            {{ item.name }}
          </router-link>
        </template>
      </nav>

      <!-- User Profile -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-3">
          <img
            :src="
              authStore.user?.avatar ||
              'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
            "
            :alt="authStore.user?.name"
            class="w-10 h-10 rounded-full object-cover"
          />
          <div class="flex-1 min-w-0">
            <p
              class="text-sm font-medium text-gray-900 dark:text-white truncate"
            >
              {{ authStore.user?.name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {{ userRole }}
            </p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="mt-3 w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowRightOnRectangleIcon class="w-4 h-4 mr-2" />
          Déconnexion
        </button>
      </div>
    </div>
  </aside>

  <!-- Overlay pour mobile -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
    @click="closeSidebar"
  ></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useSidebarStore } from "@/stores/sidebar";
import {
  HomeIcon,
  CubeIcon,
  ShoppingCartIcon,
  UsersIcon,
  TruckIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  BuildingStorefrontIcon,
  UserIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/outline";

// استرجاع الدور من localStorage
const userRole = localStorage.getItem("role") || "";

const router = useRouter();
const authStore = useAuthStore();
const sidebarStore = useSidebarStore();

// إعادة توجيه إن لم يكن المستخدم مسجل الدخول
if (!authStore.user) {
  router.push("/login");
}

const isOpen = computed(() => sidebarStore.isOpen);

// التحقق من الوصول حسب الدور
const hasRoleAccess = (itemRoles?: string[]): boolean => {
  if (!itemRoles || itemRoles.length === 0) return true;
  if (!userRole) return false;
  return itemRoles.includes(userRole);
};

// عناصر التنقل
const navigationItems = [
  { name: "Tableau de bord", href: "/", icon: HomeIcon },
  {
    name: "Produits",
    href: "/products",
    icon: CubeIcon,
    roles: ["admin", "delivery", "customer"],
  },
  {
    name: "Commandes",
    href: "/orders",
    icon: ShoppingCartIcon,
    roles: ["admin", "delivery", "customer"],
  },
  {
    name: "Clients",
    href: "/clients",
    icon: UsersIcon,
    roles: ["admin"],
  },
  {
    name: "Fournisseurs",
    href: "/suppliers",
    icon: TruckIcon,
    roles: ["admin"],
  },
  {
    name: "Inventaire",
    href: "/inventory",
    icon: ChartBarIcon,
    roles: ["admin", "delivery", "customer"],
  },
  {
    name: "Rapports",
    href: "/reports",
    icon: DocumentChartBarIcon,
    roles: ["admin"],
  },
  {
    name: "Livraisons",
    href: "/delivery",
    icon: TruckIcon,
    roles: ["admin", "delivery"],
  },
  {
    name: "Boutique",
    href: "/shop",
    icon: BuildingStorefrontIcon,
    roles: ["customer"],
  },
  {
    name: "Profil",
    href: "/profile",
    icon: UserIcon,
  },
];

// إغلاق الشريط الجانبي
const toggleSidebar = () => {
  sidebarStore.toggle();
};

const closeSidebar = () => {
  sidebarStore.close();
};

const closeSidebarOnMobile = () => {
  if (window.innerWidth < 1024) {
    closeSidebar();
  }
};

// تسجيل الخروج
const handleLogout = async () => {
  authStore.logout();
  await router.push("/login");
};
</script>
