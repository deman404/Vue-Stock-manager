import { defineStore } from "pinia";
import { ref } from "vue";
import path from "@/plugins/path";
import type { User, Order, Product } from "@/types";

export const useAdminStore = defineStore("admin", () => {
  const users = ref<User[]>([]);
  const orders = ref<Order[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const products = ref<Product[]>([]);

  // Fetch all users with their roles
  const fetchAllUsers = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await path.get("/admin/users");
      users.value = response.data.users;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Error loading users";
    } finally {
      isLoading.value = false;
    }
  };

  // Fetch all orders with items and user data
  const fetchAllOrders = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await path.get("/admin/orders");
      orders.value = response.data.orders;
      console.log(response.data);
    } catch (err: any) {
      error.value = err.response?.data?.message || "Error loading orders";
    } finally {
      isLoading.value = false;
    }
  };

  // Assign delivery role
  const assignDeliveryRole = async (userId: string) => {
    try {
      const response = await path.post(
        `/admin/users/${userId}/assign-delivery`
      );
      await fetchAllUsers();
      return response.data;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || "Error assigning delivery role"
      );
    }
  };

  // Remove delivery role
  const removeDeliveryRole = async (userId: string) => {
    try {
      const response = await path.post(
        `/admin/users/${userId}/remove-delivery`
      );
      await fetchAllUsers();
      return response.data;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || "Error removing delivery role"
      );
    }
  };

  // Delete user (non-admin only)
  const deleteUser = async (userId: string) => {
    try {
      await path.delete(`/admin/users/${userId}`);
      users.value = users.value.filter((user) => user.id !== userId);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Error deleting user");
    }
  };

  // Delete order
  const deleteOrder = async (orderId: string) => {
    try {
      await path.delete(`/admin/orders/${orderId}`);
      orders.value = orders.value.filter((order) => order.id !== orderId);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Error deleting order");
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await path.put(`/admin/orders/${orderId}/status`, {
        status,
      });
      const index = orders.value.findIndex((o) => o.id === orderId);
      if (index !== -1) {
        orders.value[index] = response.data.order;
      }
      return response.data;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || "Error updating order status"
      );
    }
  };

  const fetchProducts = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await path.get("/products");
      products.value = Array.isArray(response.data)
        ? response.data
        : response.data.products || [];
    } catch (err: any) {
      error.value = err.response?.data?.message || "Error loading products";
      products.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  return {
    users,
    orders,
    isLoading,
    error,
    fetchAllUsers,
    fetchAllOrders,
    assignDeliveryRole,
    removeDeliveryRole,
    deleteUser,
    deleteOrder,
    updateOrderStatus,
    fetchProducts,
  };
});