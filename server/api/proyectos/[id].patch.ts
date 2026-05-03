export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const config = useRuntimeConfig(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  return $fetch(`${config.apiUrl}/proyectos/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body,
  })
})
