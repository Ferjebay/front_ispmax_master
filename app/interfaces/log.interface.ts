export interface LogUsuario {
  id: string
  nombres: string
  email: string
}

export interface Log {
  _id: string
  id?: string | number
  user_id: string | null
  action: string
  module: string
  description: string
  severity: string
  new_value: Record<string, any> | null
  prev_value: Record<string, any> | null
  createdAt: string
  updatedAt: string
  user: LogUsuario | null
}

export interface LogStats {
  total: number
  byAction: Record<string, number>
  byModule: Record<string, number>
  bySeverity: Record<string, number>
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
}
