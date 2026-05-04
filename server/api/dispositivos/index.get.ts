export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const config = useRuntimeConfig(event)

  return $fetch(`${config.apiUrl}/devices/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
})
