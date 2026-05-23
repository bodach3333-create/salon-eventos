import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { requireAdmin } from '../../middleware/requireAdmin'

export const catalogAdminRouter = Router()

// ─── Catering ─────────────────────────────────────────────────────────────────

const cateringSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  pricePerPerson: z.number().min(0),
  type: z.enum(['CHILDREN', 'ADULTS']),
})

catalogAdminRouter.post('/catering', requireAdmin, async (req, res) => {
  const data = cateringSchema.parse(req.body)
  const pkg = await prisma.cateringPackage.create({ data })
  res.status(201).json({ data: pkg })
})

catalogAdminRouter.put('/catering/:id', requireAdmin, async (req, res) => {
  const data = cateringSchema.parse(req.body)
  const pkg = await prisma.cateringPackage.update({ where: { id: req.params.id }, data })
  res.json({ data: pkg })
})

catalogAdminRouter.delete('/catering/:id', requireAdmin, async (req, res) => {
  // Soft delete: marcar como inactivo para no romper reservas existentes
  await prisma.cateringPackage.update({
    where: { id: req.params.id },
    data: { isActive: false },
  })
  res.json({ data: { deleted: true } })
})

// ─── Bebidas ──────────────────────────────────────────────────────────────────

const drinkSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  pricePerPerson: z.number().min(0),
})

catalogAdminRouter.post('/drinks', requireAdmin, async (req, res) => {
  const data = drinkSchema.parse(req.body)
  const item = await prisma.drinksOption.create({ data })
  res.status(201).json({ data: item })
})

catalogAdminRouter.put('/drinks/:id', requireAdmin, async (req, res) => {
  const data = drinkSchema.parse(req.body)
  const item = await prisma.drinksOption.update({ where: { id: req.params.id }, data })
  res.json({ data: item })
})

catalogAdminRouter.delete('/drinks/:id', requireAdmin, async (req, res) => {
  await prisma.drinksOption.update({
    where: { id: req.params.id },
    data: { isActive: false },
  })
  res.json({ data: { deleted: true } })
})

// ─── Tortas ───────────────────────────────────────────────────────────────────

const cakeSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  price: z.number().min(0),
})

catalogAdminRouter.post('/cakes', requireAdmin, async (req, res) => {
  const data = cakeSchema.parse(req.body)
  const item = await prisma.cakeOption.create({ data })
  res.status(201).json({ data: item })
})

catalogAdminRouter.put('/cakes/:id', requireAdmin, async (req, res) => {
  const data = cakeSchema.parse(req.body)
  const item = await prisma.cakeOption.update({ where: { id: req.params.id }, data })
  res.json({ data: item })
})

catalogAdminRouter.delete('/cakes/:id', requireAdmin, async (req, res) => {
  await prisma.cakeOption.update({
    where: { id: req.params.id },
    data: { isActive: false },
  })
  res.json({ data: { deleted: true } })
})

// ─── Extras ───────────────────────────────────────────────────────────────────

const extraSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  price: z.number().min(0),
})

catalogAdminRouter.post('/extras', requireAdmin, async (req, res) => {
  const data = extraSchema.parse(req.body)
  const item = await prisma.extraItem.create({ data })
  res.status(201).json({ data: item })
})

catalogAdminRouter.put('/extras/:id', requireAdmin, async (req, res) => {
  const data = extraSchema.parse(req.body)
  const item = await prisma.extraItem.update({ where: { id: req.params.id }, data })
  res.json({ data: item })
})

catalogAdminRouter.delete('/extras/:id', requireAdmin, async (req, res) => {
  await prisma.extraItem.update({
    where: { id: req.params.id },
    data: { isActive: false },
  })
  res.json({ data: { deleted: true } })
})
