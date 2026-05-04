export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const config = useRuntimeConfig(event)

  try {
    return await $fetch(`${config.apiUrl}/devices/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status ?? 500,
      data: error.data,
      message: error.data?.message ?? error.message,
    })
  }
})
