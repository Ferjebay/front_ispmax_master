export type CampoTipo =
  | 'text'
  | 'email'
  | 'number'
  | 'tel'
  | 'url'
  | 'date'
  | 'datetime-local'
  | 'password'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'

export interface CampoAdicional {
  key: string
  label: string
  type: CampoTipo
  placeholder?: string
  options?: string[]
  required?: boolean
}

export interface Plan {
  id: string
  proyecto_id: string
  vps_id?: string | null
  nombre: string
  precio: number
  max_clients: number
  estado: boolean
  campos_adiciones?: Record<string, any>
  createdAt?: string
  updatedAt?: string
  proyecto?: {
    id: string
    nombre: string
  }
}

export interface CreatePlanPayload {
  proyecto_id: string
  vps_id?: string
  nombre: string
  precio: number
  max_clients: number
  estado?: boolean
  campos_adiciones?: Record<string, any>
}

export interface UpdatePlanPayload {
  proyecto_id?: string
  vps_id?: string
  nombre?: string
  precio?: number
  max_clients?: number
  estado?: boolean
  campos_adiciones?: Record<string, any>
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
}
