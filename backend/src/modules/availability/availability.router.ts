import { Router } from 'express'
import { z } from 'zod'
import { getMonthAvailability, getDayAvailability } from './availability.service'

export const availabilityRouter = Router()

availabilityRouter.get('/month', async (req, res) => {
  const schema = z.object({
    year: z.coerce.number().int().min(2024).max(2030),
    month: z.coerce.number().int().min(1).max(12),
  })
  const { year, month } = schema.parse(req.query)
  const data = await getMonthAvailability(year, month)
  res.json({ data })
})

availabilityRouter.get('/day/:date', async (req, res) => {
  const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido: usa YYYY-MM-DD')
  const date = dateSchema.parse(req.params.date)
  const data = await getDayAvailability(date)
  res.json({ data })
})
