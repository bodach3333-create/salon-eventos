import 'dotenv/config'
import { prisma } from './prisma'

async function main() {
  const result = await prisma.slot.updateMany({
    data: { enabledDays: [0, 1, 2, 3, 4, 5, 6] }
  })
  console.log('Slots actualizados:', result)

  // Si no hay slots, crear uno por defecto
  const count = await prisma.slot.count()
  if (count === 0) {
    await prisma.slot.create({
      data: {
        label: 'Tarde',
        startTime: '',
        endTime: '',
        enabledDays: [0, 1, 2, 3, 4, 5, 6],
        order: 0,
      }
    })
    console.log('Slot Tarde creado')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
