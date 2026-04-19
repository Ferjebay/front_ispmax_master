export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const config = useRuntimeConfig(event)

  const data = await $fetch<any>(`${config.apiUrl}/user/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  return data
})
