import type { Usuario, CreateUsuarioPayload, UpdateUsuarioPayload } from '~/interfaces/usuario.interface'

export function useUsuario() {
  const toast = useToast()

  const usuarios = ref<Usuario[]>([])
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)

  const loadUsuarios = async (currentPage = page.value, currentLimit = limit.value) => {
    loading.value = true
    try {
      const response = await $fetch<{ data: Usuario[]; total: number }>(
        '/api/usuarios',
        { params: { page: currentPage, limit: currentLimit } },
      )
      usuarios.value = response.data
      total.value = response.total
      page.value = currentPage
    } catch (error: any) {
      toast.add({
        title: 'Error al cargar usuarios',
        description: error?.data?.message ?? 'Intenta nuevamente',
        color: 'error',
      })
    } finally {
      loading.value = false
    }
  }

  const getUsuario = async (id: string): Promise<Usuario> => {
    return $fetch<Usuario>(`/api/usuarios/${id}`)
  }

  const createUsuario = async (dto: CreateUsuarioPayload): Promise<void> => {
    await $fetch('/api/usuarios', { method: 'POST', body: dto })
    toast.add({ title: 'Usuario creado exitosamente.' })
  }

  const updateUsuario = async (id: string, dto: UpdateUsuarioPayload): Promise<void> => {
    await $fetch(`/api/usuarios/${id}`, { method: 'PATCH', body: dto })
    toast.add({ title: 'Usuario actualizado exitosamente.' })
  }

  const removeUsuario = async (id: string): Promise<void> => {
    try {
      await $fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
      toast.add({ title: 'Usuario eliminado.' })
      await loadUsuarios()
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error?.data?.message ?? 'Fallo al eliminar el usuario',
        color: 'error',
      })
    }
  }

  return {
    usuarios,
    loading,
    total,
    page,
    limit,
    loadUsuarios,
    getUsuario,
    createUsuario,
    updateUsuario,
    removeUsuario,
  }
}
