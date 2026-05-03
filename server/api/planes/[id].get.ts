export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const config = useRuntimeConfig(event)
  const id = getRouterParam(event, 'id')

  return $fetch(`${config.apiUrl}/planes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
})
