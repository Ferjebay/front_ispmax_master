export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const config = useRuntimeConfig(event)

  try {
    const response = await $fetch<{ data: any[]; total: number }>(`${config.apiUrl}/logs`, {
      headers: { Authorization: `Bearer ${token}` },
      query: { page: 1, limit: 1000 },
    })

    const logs = response.data
    const byAction: Record<string, number> = {}
    const byModule: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}

    for (const log of logs) {
      const action = log.action ?? 'UNKNOWN'
      const module = log.module ?? 'UNKNOWN'
      const severity = log.severity ?? 'INFO'
      byAction[action] = (byAction[action] ?? 0) + 1
      byModule[module] = (byModule[module] ?? 0) + 1
      bySeverity[severity] = (bySeverity[severity] ?? 0) + 1
    }

    return {
      total: response.total,
      byAction,
      byModule,
      bySeverity,
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status ?? 500,
      data: error.data,
      message: error.data?.message ?? error.message,
    })
  }
})
