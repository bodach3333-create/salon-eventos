import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { getDayAvailability } from '../availability/availability.service'
import { calculateReservationPrice, toNumber } from '../pricing/pricing.engine'
import { ApiError } from '../../lib/ApiError'

export const reservationsRouter = Router()

const createReservationSchema = z.object({
  clientData: z.object({
    name: z.string().min(2, 'Nombre requerido'),
    phone: z.string().min(8, 'Teléfono requerido'),
    eventType: z.string().min(1, 'Tipo de evento requerido'),
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slotId: z.string().min(1),
  childrenCount: z.number().int().min(1),
  adultCount: z.number().int().min(0),
  services: z.object({
    cateringChildrenPackageId: z.string().optional(),
    cateringAdultsPackageId: z.string().optional(),
    drinksOptionId: z.string().optional(),
    cakeOptionId: z.string().optional(),
    extraIds: z.array(z.string()).default([]),
  }),
})

reservationsRouter.post('/', async (req, res) => {
  const body = createReservationSchema.parse(req.body)

  // 1. Verificar disponibilidad del slot
  const dayAvailability = await getDayAvailability(body.date)
  const slotAvailability = dayAvailability.slots.find((s) => s.slotId === body.slotId)

  if (!slotAvailability || slotAvailability.status !== 'available') {
    throw ApiError.conflict('El turno seleccionado no está disponible')
  }

  // 2. Cargar datos para el snapshot de precios
  const config = await prisma.businessConfig.findUnique({ where: { key: 'BASE_PRICE' } })
  const basePrice = config ? parseFloat(config.value) : 0

  const [cateringChildren, cateringAdults, drinks, cake, extraItems] = await Promise.all([
    body.services.cateringChildrenPackageId
      ? prisma.cateringPackage.findUnique({ where: { id: body.services.cateringChildrenPackageId } })
      : null,
    body.services.cateringAdultsPackageId
      ? prisma.cateringPackage.findUnique({ where: { id: body.services.cateringAdultsPackageId } })
      : null,
    body.services.drinksOptionId
      ? prisma.drinksOption.findUnique({ where: { id: body.services.drinksOptionId } })
      : null,
    body.services.cakeOptionId
      ? prisma.cakeOption.findUnique({ where: { id: body.services.cakeOptionId } })
      : null,
    body.services.extraIds.length > 0
      ? prisma.extraItem.findMany({ where: { id: { in: body.services.extraIds } } })
      : [],
  ])

  // 3. Calcular precio (función pura - sin efectos secundarios)
  const pricingSnapshot = calculateReservationPrice({
    basePrice,
    childrenCount: body.childrenCount,
    adultCount: body.adultCount,
    cateringChildrenPackage: cateringChildren
      ? { name: cateringChildren.name, pricePerPerson: toNumber(cateringChildren.pricePerPerson) }
      : null,
    cateringAdultsPackage: cateringAdults
      ? { name: cateringAdults.name, pricePerPerson: toNumber(cateringAdults.pricePerPerson) }
      : null,
    drinksOption: drinks
      ? { name: drinks.name, pricePerPerson: toNumber(drinks.pricePerPerson) }
      : null,
    cakeOption: cake ? { name: cake.name, price: toNumber(cake.price) } : null,
    extras: extraItems.map((e) => ({ name: e.name, price: toNumber(e.price) })),
  })

  // 4. Crear reserva en HOLD (atómica: verificar de nuevo y crear)
  const holdDuration = parseInt(process.env.HOLD_DURATION_MINUTES ?? '30')
  const holdUntil = new Date(Date.now() + holdDuration * 60 * 1000)

  // Re-verificar dentro de una transacción para evitar race conditions
  const reservation = await prisma.$transaction(async (tx) => {
    const existingReservation = await tx.reservation.findFirst({
      where: {
        date: body.date,
        slotId: body.slotId,
        status: { in: ['PENDING', 'HOLD', 'CONFIRMED'] },
      },
    })

    if (existingReservation) {
      throw ApiError.conflict('El turno fue tomado mientras procesabas el formulario')
    }

    return tx.reservation.create({
      data: {
        clientName: body.clientData.name,
        clientPhone: body.clientData.phone,
        eventType: body.clientData.eventType,
        date: body.date,
        slotId: body.slotId,
        childrenCount: body.childrenCount,
        adultCount: body.adultCount,
        cateringChildrenPackageId: body.services.cateringChildrenPackageId,
        cateringAdultsPackageId: body.services.cateringAdultsPackageId,
        drinksOptionId: body.services.drinksOptionId,
        cakeOptionId: body.services.cakeOptionId,
        extras: {
          create: body.services.extraIds.map((id) => ({ extraItemId: id })),
        },
        pricingSnapshot: pricingSnapshot as object,
        status: 'HOLD',
        holdUntil,
      },
      include: { slot: true, extras: { include: { extra: true } } },
    })
  })

  res.status(201).json({ data: reservation })
})
