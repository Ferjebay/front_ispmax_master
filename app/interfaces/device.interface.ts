export interface Device {
  id: string
  user_id: string
  ip: string
  userAgent: string
  deviceName: string | null
  lastUsed: string
  created_at: string
}
