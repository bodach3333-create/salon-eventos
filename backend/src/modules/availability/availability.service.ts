import { prisma } from '../../lib/prisma'
import { getDaysInMonth, format, parseISO } from 'date-fns'

export type SlotStatus = 'available' | 'pending' | 'reserved' | 'blocked' | 'closed'

export interface SlotAvailability {
  slotId: string
  slot: { id: string; label: string; startTime: string; endTime: string }
  status: SlotStatus
}

export interface DayAvailability {
  date: string
  isDayOpen: boolean
  slots: SlotAvailability[]
}

export async function getMonthAvailability(
  year: number,
  month: number, // 1-based
): Promise<DayAvailability[]> {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1))
  const dates: string[] = []

  for (let d = 1; d <= daysInMonth; d++) {
    dates.push(format(new Date(year, month - 1, d), 'yyyy-MM-dd'))
  }

  return Promise.all(dates.map((date) => getDayAvailability(date)))
}

export async function getDayAvailability(date: string): Promise<DayAvailability> {
  const dayOfWeek = parseISO(date).getDay() // 0=Sun, 6=Sat

  // Obtener todos los slots activos para este día de la semana
  const slots = await prisma.slot.findMany({
    where: {
      isActive: true,
      enabledDays: { has: dayOfWeek },
    },
    orderBy: { order: 'asc' },
  })

  if (slots.length === 0) {
    return { date, isDayOpen: false, slots: [] }
  }

  // Cargar bloqueos y reservas en paralelo
  const [blocks, reservations] = await Promise.all([
    prisma.dateBlock.findMany({
      where: { date },
    }),
    prisma.reservation.findMany({
      where: {
        date,
        status: { in: ['HOLD', 'CONFIRMED', 'PENDING'] },
      },
      select: { slotId: true, status: true },
    }),
  ])

  // Bloqueo de día completo
  const isDayBlocked = blocks.some((b) => b.slotId === null)
  if (isDayBlocked) {
    return { date, isDayOpen: false, slots: [] }
  }

  const slotAvailabilities: SlotAvailability[] = slots.map((slot) => {
    // Bloqueo específico del slot
    const isSlotBlocked = blocks.some((b) => b.slotId === slot.id)
    if (isSlotBlocked) {
      return { slotId: slot.id, slot, status: 'blocked' }
    }

    // Reserva existente
    const reservation = reservations.find((r) => r.slotId === slot.id)
    if (reservation) {
      if (reservation.status === 'CONFIRMED') return { slotId: slot.id, slot, status: 'reserved' }
      if (reservation.status === 'HOLD') return { slotId: slot.id, slot, status: 'pending' }
      if (reservation.status === 'PENDING') return { slotId: slot.id, slot, status: 'pending' }
    }

    return { slotId: slot.id, slot, status: 'available' }
  })

  return {
    date,
    isDayOpen: true,
    slots: slotAvailabilities,
  }
}
