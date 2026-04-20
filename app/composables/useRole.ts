export interface Role {
  id: string
  nombre: string
  descripcion: string
  estado: boolean
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
}

export function useRole() {
  const { api } = useHelper()
  const toast = useToast()

  const roles = ref<Role[]>([])
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)

  const loadRoles = async (currentPage = page.value, currentLimit = limit.value) => {
    loading.value = true
    try {
      const { data, meta } = await api<{ data: Role[]; meta: PaginationMeta }>('roles', {
        params: { page: currentPage, limit: currentLimit },
      })
      roles.value = data
      total.value = meta.total
      page.value = currentPage
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error?.data?.message ?? 'Fallo al cargar los roles',
        color: 'error',
      })
    } finally {
      loading.value = false
    }
  }

  const removeRole = async (roleId: string) => {
    try {
      await api(`roles/${roleId}`, { method: 'DELETE' })
      toast.add({ title: 'Rol eliminado.' })
      await loadRoles()
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error?.data?.message ?? 'Fallo al eliminar el rol',
        color: 'error',
      })
    }
  }

  const restoreRole = async (roleId: string) => {
    try {
      await api(`roles/restore/${roleId}`, { method: 'PUT' })
      toast.add({ title: 'Rol restaurado.' })
      await loadRoles()
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error?.data?.message ?? 'Fallo al restaurar el rol',
        color: 'error',
      })
    }
  }

  return {
    roles,
    loading,
    total,
    page,
    limit,
    loadRoles,
    removeRole,
    restoreRole,
  }
}
