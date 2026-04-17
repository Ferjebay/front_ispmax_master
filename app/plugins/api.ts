import axios from 'axios'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = axios.create({
    baseURL: `${config.public.API_URL}/api`,
    headers: { 'Content-Type': 'application/json' }
  })

  // Exponer como $api
  return {
    provide: { api }
  }
})
