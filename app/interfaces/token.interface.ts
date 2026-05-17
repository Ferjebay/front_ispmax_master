export type TipoPeriodo = 'mensual' | 'anual' | 'semestral'
export type TipoToken = 'api_token' | 'activacion'
export type EstadoToken = 'activo' | 'inactivo' | 'en_uso' | 'expirado'

export interface Token {
  id: string
  cliente_id: string
  plan_id: string
  tipo_periodo: TipoPeriodo
  periodo_meses: number
  costo: number
  descuento?: number
  periodo_meses_gracias?: number
  tipo: TipoToken
  estado: EstadoToken
  expires_at?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateTokenPayload {
  cliente_id: string
  plan_id: string
  tipo_periodo: TipoPeriodo
  periodo_meses: number
  costo: number
  descuento?: number
  periodo_meses_gracias?: number
  tipo: TipoToken
  expires_at?: string
}
