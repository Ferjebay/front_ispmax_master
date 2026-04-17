export const useUser = () => {
  const { $api } = useNuxtApp()
  const { showAlert } = useUtils()

  const users = ref([])
  const loading = ref(false)
  const pagination = ref({
    sortBy: 'desc',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0
  })

  const loadUsers = async (page = 1, limit = 10, filter) => {
    loading.value = true
    try {
      const { data: { data, meta } } = await $api.get('/user', {
        params: { page, limit, filter }
      })
      users.value = data
      pagination.value.rowsNumber = meta.total
    } catch (error) {
      showAlert('Fallo al cargar los usuarios', 'negative')
    } finally {
      loading.value = false
    }
  }

  const setStatusUser = async (isActive, userId, currentPage) => {
    try {
      await $api.patch(`/user/${userId}`, { isActive: !isActive })
      showAlert('Estado actualizado.')
      await loadUsers(currentPage)
    } catch (error) {
      showAlert(error.response?.data?.message ?? 'Fallo al actualizar el estado', 'negative')
    }
  }

  const onRequest = async (props) => {
    const { page, rowsPerPage } = props.pagination
    await loadUsers(page, rowsPerPage, props.filter)
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
  }

  return {
    users,
    loading,
    pagination,
    loadUsers,
    setStatusUser,
    onRequest,
  }
}