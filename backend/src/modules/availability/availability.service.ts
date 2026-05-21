import { prisma } from '../../lib/prisma'

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

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr + 'T12:00:00').getDay()
}

function padDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export async function getMonthAvailability(year: number, month: number): Promise<DayAvailability[]> {
  const daysInMonth = getDaysInMonth(year, month)
  const dates: string[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push(padDate(year, month, d))
  }
  return Promise.all(dates.map((date) => getDayAvailability(date)))
}

export async function getDayAvailability(date: string): Promise<DayAvailability> {
  const dayOfWeek = getDayOfWeek(date)
  const slots = await prisma.slot.findMany({
    where: { isActive: true, enabledDays: { has: dayOfWeek } },
    orderBy: { order: 'asc' },
  })

  if (slots.length === 0) {
    return { date, isDayOpen: false, slots: [] }
  }

  const [blocks, reservations] = await Promise.all([
    prisma.dateBlock.findMany({ where: { date } }),
    prisma.reservation.findMany({
      where: { date, status: { in: ['HOLD', 'CONFIRMED', 'PENDING'] } },
      select: { slotId: true, status: true },
    }),
  ])

  const isDayBlocked = blocks.some((b) => b.slotId === null)
  if (isDayBlocked) {
    return { date, isDayOpen: false, slots: [] }
  }

  const slotAvailabilities: SlotAvailability[] = slots.map((slot) => {
    const isSlotBlocked = blocks.some((b) => b.slotId === slot.id)
    if (isSlotBlocked) return { slotId: slot.id, slot, status: 'blocked' }
    const reservation = reservations.find((r) => r.slotId === slot.id)
    if (reservation) {
      if (reservation.status === 'CONFIRMED') return { slotId: slot.id, slot, status: 'reserved' }
      return { slotId: slot.id, slot, status: 'pending' }
    }
    return { slotId: slot.id, slot, status: 'available' }
  })

  return { date, isDayOpen: true, slots: slotAvailabilities }
}