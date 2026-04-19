export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig(event)

  const data = await $fetch<any>(`${config.apiUrl}/user/login/2fa`, {
    method: 'POST',
    body,
  })

  if (data.token) {
    setCookie(event, 'auth_token', data.token, {
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
    })
    const { token: _token, ...rest } = data
    return rest
  }

  return data
})
