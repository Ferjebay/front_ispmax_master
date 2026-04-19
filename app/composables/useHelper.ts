export function useHelper() {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('auth_token')
  const router = useRouter()

  const api = <T = unknown>(
    path: string,
    options: Parameters<typeof $fetch>[1] = {}
  ) => {
    return $fetch<T>(`${config.public.API_URL}/${path}`, {
      ...options,
      headers: {
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
        ...(options.headers as Record<string, string> ?? {}),
      },
      onResponseError({ response }) {
        if (response.status === 401) {
          token.value = null
          router.push('/')
        }
      },
    })
  }

  return { api }
}
