import 'dotenv/config'
import { prisma } from './prisma'

async function main() {
  console.log('🌱 Seeding database...')

  // Config del negocio
  await prisma.businessConfig.upsert({
    where: { key: 'BUSINESS_NAME' },
    update: {},
    create: { key: 'BUSINESS_NAME', value: 'Salón de Eventos Infantiles' },
  })
  await prisma.businessConfig.upsert({
    where: { key: 'BASE_PRICE' },
    update: {},
    create: { key: 'BASE_PRICE', value: '80000' },
  })
  await prisma.businessConfig.upsert({
    where: { key: 'OPEN_DAYS' },
    update: {},
    create: { key: 'OPEN_DAYS', value: '[5,6,0]' }, // Viernes, Sábado, Domingo
  })

  // Slots
  await prisma.slot.upsert({
    where: { id: 'slot-manana' },
    update: {},
    create: {
      id: 'slot-manana',
      label: 'Turno Mañana',
      startTime: '10:00',
      endTime: '14:00',
      enabledDays: [5, 6, 0],
      order: 0,
    },
  })
  await prisma.slot.upsert({
    where: { id: 'slot-tarde' },
    update: {},
    create: {
      id: 'slot-tarde',
      label: 'Turno Tarde',
      startTime: '15:00',
      endTime: '19:00',
      enabledDays: [5, 6, 0],
      order: 1,
    },
  })

  // Catering infantil
  const cateringChildren = [
    { id: 'cat-ch-basico', name: 'Básico', description: 'Nuggets, papas y jugo', pricePerPerson: 3500, type: 'CHILDREN' as const },
    { id: 'cat-ch-clasico', name: 'Clásico', description: 'Milanesa, papas y bebida', pricePerPerson: 5000, type: 'CHILDREN' as const },
    { id: 'cat-ch-premium', name: 'Premium', description: 'Menú completo + postre', pricePerPerson: 7000, type: 'CHILDREN' as const },
  ]
  for (const pkg of cateringChildren) {
    await prisma.cateringPackage.upsert({
      where: { id: pkg.id },
      update: {},
      create: { ...pkg, order: cateringChildren.indexOf(pkg) },
    })
  }

  // Catering adultos
  const cateringAdults = [
    { id: 'cat-ad-picada', name: 'Picada', description: 'Fiambres, quesos y panes', pricePerPerson: 4500, type: 'ADULTS' as const },
    { id: 'cat-ad-pizza', name: 'Pizza Party', description: 'Variedad de pizzas y fainá', pricePerPerson: 5500, type: 'ADULTS' as const },
    { id: 'cat-ad-parrilla', name: 'Parrilla Simple', description: 'Chorizo, morcilla y pollo', pricePerPerson: 8000, type: 'ADULTS' as const },
  ]
  for (const pkg of cateringAdults) {
    await prisma.cateringPackage.upsert({
      where: { id: pkg.id },
      update: {},
      create: { ...pkg, order: cateringAdults.indexOf(pkg) },
    })
  }

  // Bebidas
  await prisma.drinksOption.upsert({
    where: { id: 'drink-sin-alcohol' },
    update: {},
    create: { id: 'drink-sin-alcohol', name: 'Sin alcohol', description: 'Gaseosas y jugos', pricePerPerson: 1200, order: 0 },
  })
  await prisma.drinksOption.upsert({
    where: { id: 'drink-con-alcohol' },
    update: {},
    create: { id: 'drink-con-alcohol', name: 'Con alcohol', description: 'Vino, cerveza y gaseosas', pricePerPerson: 2000, order: 1 },
  })

  // Tortas
  await prisma.cakeOption.upsert({
    where: { id: 'cake-chica' },
    update: {},
    create: { id: 'cake-chica', name: 'Chica (10 porciones)', description: 'Húmeda con crema', price: 12000, order: 0 },
  })
  await prisma.cakeOption.upsert({
    where: { id: 'cake-grande' },
    update: {},
    create: { id: 'cake-grande', name: 'Grande (20 porciones)', description: 'Húmeda con crema + decoración temática', price: 22000, order: 1 },
  })

  // Extras
  const extras = [
    { id: 'extra-mago', name: 'Show de magia', description: '45 minutos', price: 15000 },
    { id: 'extra-pintacaras', name: 'Pinta caritas', description: '2 horas', price: 10000 },
    { id: 'extra-globos', name: 'Decoración con globos', description: 'Arco + columnas', price: 8000 },
    { id: 'extra-candy', name: 'Candy bar', description: 'Mesa dulce decorada', price: 20000 },
  ]
  for (const extra of extras) {
    await prisma.extraItem.upsert({
      where: { id: extra.id },
      update: {},
      create: { ...extra, order: extras.indexOf(extra) },
    })
  }

  console.log('✅ Seed completado')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
