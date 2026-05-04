import type { Cliente, CreateClientePayload, UpdateClientePayload } from '~/interfaces/cliente.interface'

export function useCliente() {
  const toast = useToast()

  const clientes = ref<Cliente[]>([])
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)

  const loadClientes = async (currentPage = page.value, currentLimit = limit.value) => {
    loading.value = true
    try {
      const response = await $fetch<{ data: Cliente[]; total: number }>(
        '/api/clientes',
        { params: { page: currentPage, limit: currentLimit } },
      )
      clientes.value = response.data
      total.value = response.total
      page.value = currentPage
    } catch (error: any) {
      toast.add({
        title: 'Error al cargar clientes',
        description: error?.data?.message ?? 'Intenta nuevamente',
        color: 'error',
      })
    } finally {
      loading.value = false
    }
  }

  const getCliente = async (id: string): Promise<Cliente> => {
    return await $fetch<Cliente>(`/api/clientes/${id}`)
  }

  const createCliente = async (dto: CreateClientePayload): Promise<void> => {
    await $fetch('/api/clientes', { method: 'POST', body: dto })
    toast.add({ title: 'Cliente creado exitosamente.' })
  }

  const updateCliente = async (id: string, dto: UpdateClientePayload): Promise<void> => {
    await $fetch(`/api/clientes/${id}`, { method: 'PATCH', body: dto })
    toast.add({ title: 'Cliente actualizado exitosamente.' })
  }

  const removeCliente = async (id: string): Promise<void> => {
    try {
      await $fetch(`/api/clientes/${id}`, { method: 'DELETE' })
      toast.add({ title: 'Cliente eliminado.' })
      await loadClientes()
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error?.data?.message ?? 'Fallo al eliminar el cliente',
        color: 'error',
      })
    }
  }

  const restoreCliente = async (id: string): Promise<void> => {
    try {
      await $fetch(`/api/clientes/restore/${id}`, { method: 'PUT' })
      toast.add({ title: 'Cliente restaurado.' })
      await loadClientes()
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error?.data?.message ?? 'Fallo al restaurar el cliente',
        color: 'error',
      })
    }
  }

  return {
    clientes,
    loading,
    total,
    page,
    limit,
    loadClientes,
    getCliente,
    createCliente,
    updateCliente,
    removeCliente,
    restoreCliente,
  }
}
