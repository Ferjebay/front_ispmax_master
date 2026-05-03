export interface Cliente {
  id: string
  identificacion: string
  nombres: string
  email: string
  empresa: string
  dns: string
  estado: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateClientePayload {
  identificacion: string
  nombres: string
  email: string
  empresa: string
  dns: string
  estado?: boolean
}

export interface UpdateClientePayload {
  identificacion?: string
  nombres?: string
  email?: string
  empresa?: string
  dns?: string
  estado?: boolean
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
}
