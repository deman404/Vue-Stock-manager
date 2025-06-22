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
  const clients = ref<User[]>([]);
  const suppliers = ref<User[]>([]);

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

  // Create product (admin only)
  const createProduct = async (productData: {
    name: string
    description?: string
    price: number
    stock: number
    image?: string
  }) => {
    isLoading.value = true
    try {
      const response = await path.post('/products', productData)
      products.value.unshift(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error creating product'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update product (admin only)
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    isLoading.value = true
    try {
      const response = await path.put(`/products/${id}`, updates)
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error updating product'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Delete product (admin only)
  const deleteProduct = async (id: string) => {
    isLoading.value = true
    try {
      await path.delete(`/products/${id}`)
      products.value = products.value.filter(p => p.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error deleting product'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Create order (admin only)
  const createOrder = async (orderData: any) => {
    isLoading.value = true
    try {
      const response = await path.post('/orders', orderData)
      orders.value.unshift(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error creating order'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update order status (admin only)
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await path.put(`/admin/orders/${orderId}/status`, { status })
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index] = response.data.order
      }
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error updating order status')
    }
  }

  // Get single order (admin only)
  const getOrderById = async (id: string) => {
    isLoading.value = true
    try {
      const response = await path.get(`/admin/orders/${id}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error loading order'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Fetch all products (admin)
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


  const fetchClients = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await path.get("/admin/users")

      clients.value = (response.data.users || []).filter((u: any) =>
        Array.isArray(u.roles) ? u.roles.some((r: any) => r.name === "customer") : false
      )
    } catch (err: any) {
      error.value = err.response?.data?.message || "Error loading clients"
      clients.value = []
    } finally {
      isLoading.value = false
    }
  }


  const fetchSuppliers = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await path.get("/admin/users")

      suppliers.value = (response.data.users || []).filter((u: any) =>
        Array.isArray(u.roles) ? u.roles.some((r: any) => r.name === "supplier") : false
      )
    } catch (err: any) {
      error.value = err.response?.data?.message || "Error loading suppliers"
      suppliers.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Take order (for delivery users)
  const takeOrder = async (orderId: string) => {
    try {
      const response = await path.put(`/orders/${orderId}/take`);
      const index = orders.value.findIndex(o => o.id === orderId);
      if (index !== -1) {
        orders.value[index] = response.data.order;
      }
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error taking order');
    }
  };

  // Fetch orders for delivery role
  const fetchDeliveryOrders = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await path.get("/orders");
      orders.value = Array.isArray(response.data)
        ? response.data
        : response.data.orders || [];
    } catch (err: any) {
      error.value = err.response?.data?.message || "Error loading orders";
      orders.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  return {
    users,
    orders,
    products,
    clients,
    suppliers,
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
    createProduct,
    updateProduct,
    deleteProduct,
    createOrder,
    getOrderById,
    fetchClients,
    fetchSuppliers,
    takeOrder,
    fetchDeliveryOrders,
  };
});