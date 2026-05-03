export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const config = useRuntimeConfig(event)
  const body = await readBody(event)

  return $fetch(`${config.apiUrl}/permisos`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  })
})
