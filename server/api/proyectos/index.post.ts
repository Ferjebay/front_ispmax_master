export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const config = useRuntimeConfig(event)
  const body = await readBody(event)

  try {
    return await $fetch(`${config.apiUrl}/proyectos`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body,
    })
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status ?? 500,
      data: error.data,
      message: error.data?.message ?? error.message,
    })
  }
})
