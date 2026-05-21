import { prisma } from './prisma'

// Job simple que corre cada 5 minutos y expira HOLDs vencidos
export const holdExpiryJob = {
  interval: null as ReturnType<typeof setInterval> | null,

  start() {
    console.log('⏰ Hold expiry job iniciado (cada 5 minutos)')
    this.run() // correr inmediatamente al inicio
    this.interval = setInterval(() => this.run(), 5 * 60 * 1000)
  },

  stop() {
    if (this.interval) clearInterval(this.interval)
  },

  async run() {
    try {
      const result = await prisma.reservation.updateMany({
        where: {
          status: 'HOLD',
          holdUntil: { lt: new Date() },
        },
        data: { status: 'EXPIRED' },
      })

      if (result.count > 0) {
        console.log(`✅ ${result.count} hold(s) expirados`)
      }
    } catch (error) {
      console.error('Error en hold expiry job:', error)
    }
  },
}
