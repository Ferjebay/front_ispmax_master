export interface HistorialPago {
  id: string
  cliente_id: string
  suscripcion_id: string
  estado: string | null
  monto: string | null
  numero_ciclo: number | null
  fecha_inicio: string | null
  fecha_fin: string | null
  paid_at: string | null
  referencia_pago: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Suscripcion {
  id: string
  cliente_id: string
  plan_id: string
  costo: string
  descuento: string | null
  dns: string | null
  estado: string
  periodo_meses: number
  periodo_meses_gracias: number | null
  tipo_periodo: string
  historial_pagos: HistorialPago[]
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Cliente {
  id: string
  identificacion: string
  nombres: string
  email: string
  empresa: string
  dns?: string
  estado: boolean
  suscripciones?: Suscripcion[]
  historial_pagos?: HistorialPago[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateClientePayload {
  identificacion: string
  nombres: string
  email: string
  empresa: string
  estado?: boolean
}

export interface UpdateClientePayload {
  identificacion?: string
  nombres?: string
  email?: string
  empresa?: string
  estado?: boolean
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
}
