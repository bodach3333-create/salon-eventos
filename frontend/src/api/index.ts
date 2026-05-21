import apiClient from '@/lib/api-client'
import type {
  DayAvailability,
  CateringPackage,
  DrinksOption,
  CakeOption,
  ExtraItem,
  BusinessConfig,
  PricingSnapshot,
  BookingFormData,
  Reservation,
} from '@/types'

// ─── Disponibilidad ────────────────────────────────────────────────────────────

export const availabilityApi = {
  getMonth: async (year: number, month: number): Promise<DayAvailability[]> => {
    const { data } = await apiClient.get(`/availability/month`, {
      params: { year, month },
    })
    return data.data
  },

  getDay: async (date: string): Promise<DayAvailability> => {
    const { data } = await apiClient.get(`/availability/day/${date}`)
    return data.data
  },
}

// ─── Catálogo de servicios ────────────────────────────────────────────────────

export const catalogApi = {
  getCateringPackages: async (): Promise<CateringPackage[]> => {
    const { data } = await apiClient.get('/catalog/catering')
    return data.data
  },

  getDrinksOptions: async (): Promise<DrinksOption[]> => {
    const { data } = await apiClient.get('/catalog/drinks')
    return data.data
  },

  getCakeOptions: async (): Promise<CakeOption[]> => {
    const { data } = await apiClient.get('/catalog/cakes')
    return data.data
  },

  getExtras: async (): Promise<ExtraItem[]> => {
    const { data } = await apiClient.get('/catalog/extras')
    return data.data
  },

  getBusinessConfig: async (): Promise<BusinessConfig> => {
    const { data } = await apiClient.get('/catalog/config')
    return data.data
  },
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

export const pricingApi = {
  estimate: async (input: {
    date: string
    slotId: string
    childrenCount: number
    adultCount: number
    services: {
      cateringChildrenPackageId?: string
      cateringAdultsPackageId?: string
      drinksOptionId?: string
      cakeOptionId?: string
      extraIds: string[]
    }
  }): Promise<PricingSnapshot> => {
    const { data } = await apiClient.post('/pricing/estimate', input)
    return data.data
  },
}

// ─── Reservas (cliente) ────────────────────────────────────────────────────────

export const reservationsApi = {
  create: async (formData: BookingFormData): Promise<Reservation> => {
    const payload = {
      clientData: {
        name: formData.clientName,
        phone: formData.clientPhone,
        eventType: formData.eventType,
      },
      date: formData.date,
      slotId: formData.slotId,
      childrenCount: formData.childrenCount,
      adultCount: formData.adultCount,
      services: {
        cateringChildrenPackageId: formData.cateringChildrenPackageId,
        cateringAdultsPackageId: formData.cateringAdultsPackageId,
        drinksOptionId: formData.drinksOptionId,
        cakeOptionId: formData.cakeOptionId,
        extraIds: formData.extraIds,
      },
    }
    const { data } = await apiClient.post('/reservations', payload)
    return data.data
  },
}

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = {
  login: async (password: string): Promise<{ token: string }> => {
    const { data } = await apiClient.post('/admin/login', { password })
    return data.data
  },

  getReservations: async (params?: {
    status?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<Reservation[]> => {
    const { data } = await apiClient.get('/admin/reservations', { params })
    return data.data
  },

  updateReservationStatus: async (
    id: string,
    status: string,
    notes?: string,
  ): Promise<Reservation> => {
    const { data } = await apiClient.patch(`/admin/reservations/${id}/status`, {
      status,
      notes,
    })
    return data.data
  },

  blockDate: async (date: string, slotId?: string, reason?: string) => {
    const { data } = await apiClient.post('/admin/blocks', { date, slotId, reason })
    return data.data
  },

  unblockDate: async (blockId: string) => {
    const { data } = await apiClient.delete(`/admin/blocks/${blockId}`)
    return data.data
  },
}
