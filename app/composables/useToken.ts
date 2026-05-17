import type { Token, CreateTokenPayload } from '~/interfaces/token.interface'

export function useToken() {
  const toast = useToast()

  const tokens = ref<Token[]>([])
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)

  const loadTokens = async (currentPage = page.value, currentLimit = limit.value) => {
    loading.value = true
    try {
      const response = await $fetch<{ data: Token[]; total: number }>(
        '/api/tokens',
        { params: { page: currentPage, limit: currentLimit } },
      )
      tokens.value = response.data
      total.value = response.total
      page.value = currentPage
    } catch (error: any) {
      toast.add({
        title: 'Error al cargar tokens',
        description: error?.data?.message ?? 'Intenta nuevamente',
        color: 'error',
      })
    } finally {
      loading.value = false
    }
  }

  const getToken = async (id: string): Promise<Token> => {
    return await $fetch<Token>(`/api/tokens/${id}`)
  }

  const createToken = async (dto: CreateTokenPayload): Promise<void> => {
    await $fetch('/api/tokens', { method: 'POST', body: dto })
    toast.add({ title: 'Token creado exitosamente.' })
  }

  const deactivateToken = async (id: string): Promise<void> => {
    try {
      await $fetch(`/api/tokens/deactivate/${id}`, { method: 'PATCH' })
      toast.add({ title: 'Token desactivado.' })
      await loadTokens()
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error?.data?.message ?? 'Fallo al desactivar el token',
        color: 'error',
      })
    }
  }

  const activateService = async (identificacion: string): Promise<void> => {
    await $fetch('/api/tokens/activate', { method: 'POST', body: { identificacion } })
    toast.add({ title: 'Servicio activado exitosamente.' })
  }

  const removeToken = async (id: string): Promise<void> => {
    try {
      await $fetch(`/api/tokens/${id}`, { method: 'DELETE' })
      toast.add({ title: 'Token eliminado.' })
      await loadTokens()
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error?.data?.message ?? 'Fallo al eliminar el token',
        color: 'error',
      })
    }
  }

  return {
    tokens,
    loading,
    total,
    page,
    limit,
    loadTokens,
    getToken,
    createToken,
    deactivateToken,
    activateService,
    removeToken,
  }
}
