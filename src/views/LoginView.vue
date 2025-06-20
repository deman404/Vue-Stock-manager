<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
    <div class="max-w-md w-full space-y-8 p-8">
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-6">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
          StockFlow
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Connectez-vous à votre compte
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <form @submit.prevent="handleLogin">
          <div class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Adresse email
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="input-field mt-1"
                placeholder="vous@exemple.com"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mot de passe
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="input-field mt-1"
                placeholder="••••••••"
              />
            </div>

            <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-600">{{ error }}</p>
            </div>

            <button
              type="submit"
              ::disabled="authStore.isLoading"

              class="btn btn-primary w-full py-3"
            >
            <span v-if="authStore.isLoading" class="flex items-center justify-center">                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </span>
              <span v-else>Se connecter</span>
            </button>
          </div>
        </form>

        <!-- Demo credentials -->
        <div class="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Comptes de démonstration :
          </h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Admin:</span>
              <span class="font-mono">admin@example.com / password</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Client:</span>
              <span class="font-mono">testuser@example.com/ password123</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">delivry:</span>
              <span class="font-mono">delivry@gmail.com / password123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('admin@example.com')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  
  const result = await authStore.login(email.value, password.value)
  
  if (result.success) {
    await router.push('/')
  } else {
    error.value = result.error || 'Une erreur est survenue lors de la connexion.'
  }
}
</script>
