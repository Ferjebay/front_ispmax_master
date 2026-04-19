export default defineNuxtPlugin(async () => {
  const { user, isAuthenticated } = useAuth()
  if (isAuthenticated.value && !user.value) {
    try {
      const data = await $fetch<any>('/api/auth/me')
      user.value = { ...data, sidebar: data.sidebar ?? [] }
    } catch {
      // token inválido — el middleware redirigirá al login
    }
  }
})
