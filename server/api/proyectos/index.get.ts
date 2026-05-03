export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const config = useRuntimeConfig(event)
  const query = getQuery(event)

  return $fetch(`${config.apiUrl}/proyectos`, {
    headers: { Authorization: `Bearer ${token}` },
    query,
  })
})
