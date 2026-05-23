import 'express-async-errors'
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import { errorHandler } from './middleware/errorHandler'
import { availabilityRouter } from './modules/availability/availability.router'
import { catalogRouter } from './modules/catering/catalog.router'
import { pricingRouter } from './modules/pricing/pricing.router'
import { reservationsRouter } from './modules/reservations/reservations.router'
import { adminRouter } from './modules/admin/admin.router'
import { catalogAdminRouter } from './modules/admin/catalog.admin.router'
import { holdExpiryJob } from './lib/holdExpiryJob'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/availability', availabilityRouter)
app.use('/api/catalog', catalogRouter)
app.use('/api/pricing', pricingRouter)
app.use('/api/reservations', reservationsRouter)
app.use('/api/admin', adminRouter)
app.use('/api/admin/catalog', catalogAdminRouter)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`)
  holdExpiryJob.start()
})

export default app
