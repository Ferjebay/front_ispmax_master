export interface Proyecto {
  id: string
  nombre: string
  sku: string
  estado: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateProyectoPayload {
  nombre: string
  sku: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
}
