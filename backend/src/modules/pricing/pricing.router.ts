import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { calculateReservationPrice, toNumber } from './pricing.engine'
import { ApiError } from '../../lib/ApiError'

export const pricingRouter = Router()

const estimateSchema = z.object({
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

pricingRouter.post('/estimate', async (req, res) => {
  const body = estimateSchema.parse(req.body)

  // Obtener precio base del negocio
  const config = await prisma.businessConfig.findUnique({ where: { key: 'BASE_PRICE' } })
  const basePrice = config ? parseFloat(config.value) : 0

  // Cargar entidades necesarias en paralelo
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

  const result = calculateReservationPrice({
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

  res.json({ data: result })
})
