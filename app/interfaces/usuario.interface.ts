export interface Usuario {
  id: string
  email: string
  usuario: string
  celular?: string
  rol?: { id: string; nombre: string }
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateUsuarioPayload {
  email: string
  password: string
  usuario: string
  celular?: string
  rol_id?: string
}

export interface UpdateUsuarioPayload {
  email?: string
  password?: string
  usuario?: string
  celular?: string
  rol_id?: string
  isActive?: boolean
}

export interface UsuarioPaginationMeta {
  total: number
  page: number
  limit: number
}
