import { Router } from 'express'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { prisma } from '../../lib/prisma'
import { requireAdmin } from '../../middleware/requireAdmin'
import { ApiError } from '../../lib/ApiError'

export const adminRouter = Router()

adminRouter.post('/login', async (req, res) => {
  const { password } = z.object({ password: z.string() }).parse(req.body)
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword || password !== adminPassword) {
    throw ApiError.unauthorized('Contraseña incorrecta')
  }
  const secret = process.env.JWT_SECRET
  if (!secret) throw ApiError.internal('JWT_SECRET no configurado')
  const token = jwt.sign({ role: 'admin' }, secret)
  res.json({ data: { token } })
})

adminRouter.get('/reservations', requireAdmin, async (req, res) => {
  const schema = z.object({
    status: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  })
  const { status, dateFrom, dateTo } = schema.parse(req.query)
  const reservations = await prisma.reservation.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(dateFrom || dateTo ? { date: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) } } : {}),
    },
    include: { slot: true, extras: { include: { extra: true } } },
    orderBy: [{ date: 'asc' }, { createdAt: 'desc' }],
  })
  res.json({ data: reservations })
})

adminRouter.patch('/reservations/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params
  const { status, notes } = z.object({
    status: z.enum(['PENDING', 'HOLD', 'CONFIRMED', 'CANCELLED', 'EXPIRED']),
    notes: z.string().optional(),
  }).parse(req.body)
  const reservation = await prisma.reservation.update({
    where: { id },
    data: { status, ...(notes !== undefined ? { notes } : {}) },
    include: { slot: true },
  })
  res.json({ data: reservation })
})

adminRouter.get('/blocks', requireAdmin, async (_req, res) => {
  const blocks = await prisma.dateBlock.findMany({
    include: { slot: true },
    orderBy: { date: 'asc' },
  })
  res.json({ data: blocks })
})

adminRouter.post('/blocks', requireAdmin, async (req, res) => {
  const { date, slotId, reason } = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    slotId: z.string().optional(),
    reason: z.string().optional(),
  }).parse(req.body)
  const block = await prisma.dateBlock.create({
    data: { date, slotId, reason },
    include: { slot: true },
  })
  res.status(201).json({ data: block })
})

adminRouter.delete('/blocks/:id', requireAdmin, async (req, res) => {
  await prisma.dateBlock.delete({ where: { id: req.params.id } })
  res.json({ data: { deleted: true } })
})

adminRouter.get('/slots', requireAdmin, async (_req, res) => {
  const slots = await prisma.slot.findMany({ orderBy: { order: 'asc' } })
  res.json({ data: slots })
})

adminRouter.post('/slots', requireAdmin, async (req, res) => {
  const schema = z.object({
    label: z.string().min(1),
    startTime: z.string(),
    endTime: z.string(),
    enabledDays: z.array(z.number().int().min(0).max(6)),
    order: z.number().int().optional(),
  })
  const data = schema.parse(req.body)
  const slot = await prisma.slot.create({ data })
  res.status(201).json({ data: slot })
})