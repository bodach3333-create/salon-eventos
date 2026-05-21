import { Router } from 'express'
import { prisma } from '../../lib/prisma'

export const catalogRouter = Router()

catalogRouter.get('/catering', async (_req, res) => {
  const packages = await prisma.cateringPackage.findMany({
    where: { isActive: true },
    orderBy: [{ type: 'asc' }, { order: 'asc' }],
  })
  res.json({ data: packages })
})

catalogRouter.get('/drinks', async (_req, res) => {
  const options = await prisma.drinksOption.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })
  res.json({ data: options })
})

catalogRouter.get('/cakes', async (_req, res) => {
  const options = await prisma.cakeOption.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })
  res.json({ data: options })
})

catalogRouter.get('/extras', async (_req, res) => {
  const items = await prisma.extraItem.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })
  res.json({ data: items })
})

catalogRouter.get('/config', async (_req, res) => {
  const configs = await prisma.businessConfig.findMany()
  const config: Record<string, string> = {}
  configs.forEach((c) => { config[c.key] = c.value })

  const slots = await prisma.slot.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })

  res.json({
    data: {
      name: config['BUSINESS_NAME'] ?? 'Salón de Eventos',
      basePrice: parseFloat(config['BASE_PRICE'] ?? '0'),
      currency: 'ARS',
      slots,
      openDays: JSON.parse(config['OPEN_DAYS'] ?? '[5,6,0]'), // Vie, Sab, Dom
    },
  })
})
