// ─── Enums ────────────────────────────────────────────────────────────────────

export type ReservationStatus = 'PENDING' | 'HOLD' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED'
export type SlotStatus = 'available' | 'pending' | 'reserved' | 'blocked' | 'closed'

// ─── Slots & Disponibilidad ───────────────────────────────────────────────────

export interface Slot {
  id: string
  label: string
  startTime: string // "10:00"
  endTime: string   // "14:00"
}

export interface DayAvailability {
  date: string // "2024-03-15"
  slots: SlotAvailability[]
  isDayOpen: boolean
}

export interface SlotAvailability {
  slotId: string
  slot: Slot
  status: SlotStatus
}

// ─── Catering & Servicios ─────────────────────────────────────────────────────

export interface CateringPackage {
  id: string
  name: string
  description: string
  pricePerPerson: number
  type: 'CHILDREN' | 'ADULTS'
  isActive: boolean
}

export interface DrinksOption {
  id: string
  name: string
  description: string
  pricePerPerson: number
  isActive: boolean
}

export interface CakeOption {
  id: string
  name: string
  description: string
  price: number
  isActive: boolean
}

export interface ExtraItem {
  id: string
  name: string
  description: string
  price: number
  isActive: boolean
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

export interface PricingSnapshot {
  basePrice: number
  subtotalCateringChildren: number
  subtotalCateringAdults: number
  subtotalDrinks: number
  subtotalCake: number
  subtotalExtras: number
  total: number
  breakdown: PricingBreakdownLine[]
  snapshotAt: string
}

export interface PricingBreakdownLine {
  label: string
  quantity?: number
  unitPrice?: number
  subtotal: number
}

// ─── Reserva ──────────────────────────────────────────────────────────────────

export interface ReservationServices {
  cateringChildrenPackageId?: string
  cateringAdultsPackageId?: string
  drinksOptionId?: string
  cakeOptionId?: string
  extraIds: string[]
}

export interface ClientData {
  name: string
  phone: string
  eventType: string
}

export interface Reservation {
  id: string
  clientData: ClientData
  date: string
  slotId: string
  slot?: Slot
  childrenCount: number
  adultCount: number
  services: ReservationServices
  pricingSnapshot: PricingSnapshot
  status: ReservationStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

// ─── Booking Form (wizard del cliente) ───────────────────────────────────────

export interface BookingFormData {
  // Step 1: Datos personales
  clientName: string
  clientPhone: string
  eventType: string
  childrenCount: number
  adultCount: number

  // Step 2: Fecha y turno
  date: string
  slotId: string

  // Step 3: Servicios
  cateringChildrenPackageId?: string
  cateringAdultsPackageId?: string
  drinksOptionId?: string
  cakeOptionId?: string
  extraIds: string[]
}

// ─── API responses genéricas ──────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
}

// ─── Config del negocio ───────────────────────────────────────────────────────

export interface BusinessConfig {
  name: string
  basePrice: number
  currency: string
  slots: Slot[]
  openDays: number[] // 0=Sunday, 1=Monday, etc.
}
