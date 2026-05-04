export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const config = useRuntimeConfig(event)
  const query = getQuery(event)

  try {
    return await $fetch(`${config.apiUrl}/planes`, {
      headers: { Authorization: `Bearer ${token}` },
      query,
    })
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status ?? 500,
      data: error.data,
      message: error.data?.message ?? error.message,
    })
  }
})
