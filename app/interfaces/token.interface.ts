export type TipoPeriodo = 'mensual' | 'anual' | 'semestral'
export type TipoToken = 'api_token' | 'activacion'
export type EstadoToken = 'activo' | 'inactivo' | 'en_uso' | 'expirado'

export interface TokenCliente {
  id: string
  identificacion: string
  nombres: string
}

export interface TokenSuscripcion {
  id: string
  cliente_id: string
  cliente: TokenCliente
  plan_id: string
  tipo_periodo: TipoPeriodo
  periodo_meses: number
  periodo_meses_gracias?: number | null
  costo: string
  descuento?: string | null
  estado: string
  dns?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface Token {
  id: string
  suscripcion_id: string
  suscripcion: TokenSuscripcion
  tipo: TipoToken
  estado: EstadoToken
  hash: string
  expires_at?: string | null
  last_validated_at?: string | null
  created_at: string
  updated_at: string
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
