export interface Permiso {
  _id: string
  nombre: string
  label?: string
  ruta?: string
  icono?: string
  orden?: number
  padre_id?: string
  visible_sidebar?: boolean
  estado: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreatePermisoPayload {
  nombre: string
  label?: string
  ruta?: string
  icono?: string
  orden?: number
  padre_id?: string
  visible_sidebar?: boolean
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
}
