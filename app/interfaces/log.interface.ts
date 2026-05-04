export interface LogUsuario {
  id: string
  nombres: string
  email: string
}

export interface Log {
  id: string | number
  accion: string
  modulo: string
  descripcion: string
  ip: string
  usuario: LogUsuario | null
  createdAt: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
}
