import { Decimal } from '@prisma/client/runtime/library'

// ─── Tipos del motor de precios ────────────────────────────────────────────────

export interface PricingInput {
  basePrice: number
  childrenCount: number
  adultCount: number
  cateringChildrenPackage?: { name: string; pricePerPerson: number } | null
  cateringAdultsPackage?: { name: string; pricePerPerson: number } | null
  drinksOption?: { name: string; pricePerPerson: number } | null
  cakeOption?: { name: string; price: number } | null
  extras?: { name: string; price: number }[]
}

export interface PricingBreakdownLine {
  label: string
  quantity?: number
  unitPrice?: number
  subtotal: number
}

export interface PricingResult {
  basePrice: number
  subtotalCateringChildren: number
  subtotalCateringAdults: number
  subtotalDrinks: number
  subtotalCake: number
  subtotalExtras: number
  total: number
  breakdown: PricingBreakdownLine[]
  snapshotAt: string
}

// ─── Función pura (sin side effects, sin DB) ──────────────────────────────────

export function calculateReservationPrice(input: PricingInput): PricingResult {
  const breakdown: PricingBreakdownLine[] = []

  // Precio base del salón
  breakdown.push({
    label: 'Salón',
    subtotal: input.basePrice,
  })

  // Catering niños
  const subtotalCateringChildren = input.cateringChildrenPackage
    ? input.cateringChildrenPackage.pricePerPerson * input.childrenCount
    : 0

  if (input.cateringChildrenPackage) {
    breakdown.push({
      label: `Catering infantil — ${input.cateringChildrenPackage.name}`,
      quantity: input.childrenCount,
      unitPrice: input.cateringChildrenPackage.pricePerPerson,
      subtotal: subtotalCateringChildren,
    })
  }

  // Catering adultos
  const subtotalCateringAdults = input.cateringAdultsPackage
    ? input.cateringAdultsPackage.pricePerPerson * input.adultCount
    : 0

  if (input.cateringAdultsPackage) {
    breakdown.push({
      label: `Catering adultos — ${input.cateringAdultsPackage.name}`,
      quantity: input.adultCount,
      unitPrice: input.cateringAdultsPackage.pricePerPerson,
      subtotal: subtotalCateringAdults,
    })
  }

  // Bebidas (niños + adultos)
  const totalPersons = input.childrenCount + input.adultCount
  const subtotalDrinks = input.drinksOption
    ? input.drinksOption.pricePerPerson * totalPersons
    : 0

  if (input.drinksOption) {
    breakdown.push({
      label: `Bebidas — ${input.drinksOption.name}`,
      quantity: totalPersons,
      unitPrice: input.drinksOption.pricePerPerson,
      subtotal: subtotalDrinks,
    })
  }

  // Torta
  const subtotalCake = input.cakeOption?.price ?? 0
  if (input.cakeOption) {
    breakdown.push({
      label: `Torta — ${input.cakeOption.name}`,
      subtotal: subtotalCake,
    })
  }

  // Extras
  const subtotalExtras = input.extras?.reduce((acc, e) => acc + e.price, 0) ?? 0
  input.extras?.forEach((extra) => {
    breakdown.push({
      label: `Extra — ${extra.name}`,
      subtotal: extra.price,
    })
  })

  const total =
    input.basePrice +
    subtotalCateringChildren +
    subtotalCateringAdults +
    subtotalDrinks +
    subtotalCake +
    subtotalExtras

  return {
    basePrice: input.basePrice,
    subtotalCateringChildren,
    subtotalCateringAdults,
    subtotalDrinks,
    subtotalCake,
    subtotalExtras,
    total,
    breakdown,
    snapshotAt: new Date().toISOString(),
  }
}

// ─── Helper: convierte Decimal de Prisma a number ─────────────────────────────
export function toNumber(val: Decimal | number | string): number {
  return typeof val === 'number' ? val : Number(val)
}
