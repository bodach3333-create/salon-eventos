import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { catalogApi, reservationsApi, availabilityApi } from '@/api'
import type { BookingFormData, DayAvailability } from '@/types'
import { format, addMonths } from 'date-fns'
import { es } from 'date-fns/locale'

// ─── Schemas de validación ─────────────────────────────────────────────────────

const step1Schema = z.object({
  clientName: z.string().min(2, 'Ingresá tu nombre completo'),
  clientPhone: z.string().min(8, 'Ingresá un teléfono válido'),
  eventType: z.string().min(1, 'Seleccioná el tipo de evento'),
  childrenCount: z.number().min(1, 'Mínimo 1 niño').max(100),
  adultCount: z.number().min(0).max(200),
})

const step2Schema = z.object({
  date: z.string().min(1, 'Seleccioná una fecha'),
  slotId: z.string().min(1, 'Seleccioná un turno'),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

// ─── Pasos del wizard ──────────────────────────────────────────────────────────
const STEPS = [
  'Tus datos',
  'Fecha y turno',
  'Servicios',
  'Confirmación',
]

export function BookingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<Partial<BookingFormData>>({
    extraIds: [],
  })
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // ─── Queries ───────────────────────────────────────────────────────────────
  const { data: monthData } = useQuery({
    queryKey: ['availability', 'month', currentMonth.getFullYear(), currentMonth.getMonth() + 1],
    queryFn: () => availabilityApi.getMonth(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
  })

  const { data: dayData } = useQuery<DayAvailability>({
    queryKey: ['availability', 'day', selectedDate],
    queryFn: () => availabilityApi.getDay(selectedDate),
    enabled: !!selectedDate,
  })

  const { data: catering } = useQuery({
    queryKey: ['catalog', 'catering'],
    queryFn: catalogApi.getCateringPackages,
    enabled: step === 2,
  })

  const { data: drinks } = useQuery({
    queryKey: ['catalog', 'drinks'],
    queryFn: catalogApi.getDrinksOptions,
    enabled: step === 2,
  })

  const { data: cakes } = useQuery({
    queryKey: ['catalog', 'cakes'],
    queryFn: catalogApi.getCakeOptions,
    enabled: step === 2,
  })

  const { data: extras } = useQuery({
    queryKey: ['catalog', 'extras'],
    queryFn: catalogApi.getExtras,
    enabled: step === 2,
  })

  // ─── Mutation: crear reserva ───────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: reservationsApi.create,
    onSuccess: (reservation) => {
      navigate(`/reserva-exitosa/${reservation.id}`)
    },
    onError: () => {
      toast.error('No pudimos procesar tu reserva. Intentá de nuevo.')
    },
  })

  // ─── Form step 1 ──────────────────────────────────────────────────────────
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      clientName: formData.clientName ?? '',
      clientPhone: formData.clientPhone ?? '',
      eventType: formData.eventType ?? '',
      childrenCount: formData.childrenCount ?? 10,
      adultCount: formData.adultCount ?? 5,
    },
  })

  const handleStep1 = (data: Step1Data) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setStep(1)
  }

  const handleStep2 = () => {
    if (!selectedDate || !formData.slotId) {
      toast.error('Seleccioná fecha y turno')
      return
    }
    setStep(2)
  }

  const handleSubmit = () => {
    createMutation.mutate(formData as BookingFormData)
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayData = monthData?.find((d) => d.date === dateStr)
    if (!dayData) return 'closed'
    if (!dayData.isDayOpen) return 'closed'
    const hasAvailable = dayData.slots.some((s) => s.status === 'available')
    return hasAvailable ? 'available' : 'reserved'
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price)

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center gap-0">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div
                className={`flex flex-col items-center ${i <= step ? 'text-brand-500' : 'text-gray-300'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-700 mb-1 transition-colors ${
                    i < step
                      ? 'bg-brand-500 text-white'
                      : i === step
                      ? 'bg-brand-500 text-white ring-4 ring-brand-100'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-xs font-body hidden sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-brand-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Step 0: Datos personales ── */}
      {step === 0 && (
        <div className="card">
          <h2 className="text-2xl font-display font-800 text-gray-900 mb-6">Contanos sobre el evento</h2>
          <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-4">
            <div>
              <label className="label-base">Nombre completo</label>
              <input
                {...step1Form.register('clientName')}
                className="input-base"
                placeholder="Ej: María García"
              />
              {step1Form.formState.errors.clientName && (
                <p className="text-xs text-red-500 mt-1">{step1Form.formState.errors.clientName.message}</p>
              )}
            </div>

            <div>
              <label className="label-base">Teléfono / WhatsApp</label>
              <input
                {...step1Form.register('clientPhone')}
                className="input-base"
                placeholder="Ej: 1155556789"
                type="tel"
              />
              {step1Form.formState.errors.clientPhone && (
                <p className="text-xs text-red-500 mt-1">{step1Form.formState.errors.clientPhone.message}</p>
              )}
            </div>

            <div>
              <label className="label-base">Tipo de evento</label>
              <select {...step1Form.register('eventType')} className="input-base">
                <option value="">Seleccioná...</option>
                <option value="cumpleanos">Cumpleaños</option>
                <option value="comunion">Comunión</option>
                <option value="bautismo">Bautismo</option>
                <option value="otro">Otro</option>
              </select>
              {step1Form.formState.errors.eventType && (
                <p className="text-xs text-red-500 mt-1">{step1Form.formState.errors.eventType.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-base">Cantidad de niños</label>
                <input
                  {...step1Form.register('childrenCount', { valueAsNumber: true })}
                  className="input-base"
                  type="number"
                  min={1}
                />
              </div>
              <div>
                <label className="label-base">Cantidad de adultos</label>
                <input
                  {...step1Form.register('adultCount', { valueAsNumber: true })}
                  className="input-base"
                  type="number"
                  min={0}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-2">
              Continuar <ChevronRight size={16} />
            </button>
          </form>
        </div>
      )}

      {/* ── Step 1: Fecha y turno ── */}
      {step === 1 && (
        <div className="card">
          <h2 className="text-2xl font-display font-800 text-gray-900 mb-6">Elegí tu fecha</h2>

          {/* Mini calendario */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth((m) => addMonths(m, -1))}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="font-display font-700 text-gray-900 capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </span>
              <button
                onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Grid de días — simplificado */}
            <p className="text-xs text-gray-400 font-body text-center mb-2">
              Seleccioná una fecha disponible
            </p>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((d) => (
                <div key={d} className="font-display font-700 text-gray-400 py-1">{d}</div>
              ))}
            </div>

            <div className="text-center text-sm text-gray-500 font-body py-4 border border-dashed border-gray-200 rounded-2xl">
              Calendario de disponibilidad se carga desde el backend.
              <br />
              <span className="text-xs text-gray-400">Integrá el componente de react-day-picker con los datos de monthData.</span>
            </div>

            <div className="flex gap-4 mt-3 text-xs font-body">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400 inline-block" />Disponible</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-brand-300 inline-block" />Reservado</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-200 inline-block" />Cerrado</span>
            </div>

            {/* Input manual mientras se integra calendario */}
            <div className="mt-4">
              <label className="label-base">Fecha del evento</label>
              <input
                type="date"
                className="input-base"
                value={selectedDate}
                min={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setFormData((prev) => ({ ...prev, date: e.target.value, slotId: '' }))
                }}
              />
            </div>
          </div>

          {/* Turnos disponibles */}
          {selectedDate && dayData && (
            <div className="mb-6">
              <h3 className="font-display font-700 text-gray-800 mb-3">Turnos disponibles</h3>
              {dayData.isDayOpen ? (
                <div className="space-y-2">
                  {dayData.slots.map((s) => (
                    <button
                      key={s.slotId}
                      onClick={() => {
                        if (s.status === 'available') {
                          setFormData((prev) => ({ ...prev, slotId: s.slotId }))
                        }
                      }}
                      disabled={s.status !== 'available'}
                      className={`w-full text-left px-4 py-3 rounded-2xl border transition-all font-body text-sm ${
                        formData.slotId === s.slotId
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : s.status === 'available'
                          ? 'border-gray-200 hover:border-brand-300'
                          : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <span className="font-display font-700">{s.slot.label}</span>
                      <span className="ml-2 text-xs">
                        {s.slot.startTime} – {s.slot.endTime}
                      </span>
                      <span className={`float-right text-xs font-600 ${s.status === 'available' ? 'text-green-600' : 'text-gray-400'}`}>
                        {s.status === 'available' ? 'Disponible' : 'Ocupado'}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 font-body bg-gray-50 rounded-2xl p-4 text-center">
                  Este día no está disponible para eventos.
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="btn-secondary flex-1">
              <ChevronLeft size={16} /> Atrás
            </button>
            <button onClick={handleStep2} className="btn-primary flex-1">
              Continuar <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Servicios ── */}
      {step === 2 && (
        <div className="card">
          <h2 className="text-2xl font-display font-800 text-gray-900 mb-6">Elegí los servicios</h2>

          <div className="space-y-6">
            {/* Catering niños */}
            <div>
              <h3 className="font-display font-700 text-gray-800 mb-2">🍕 Catering infantil</h3>
              <div className="space-y-2">
                {catering?.filter((c) => c.type === 'CHILDREN').map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        cateringChildrenPackageId:
                          prev.cateringChildrenPackageId === pkg.id ? undefined : pkg.id,
                      }))
                    }
                    className={`w-full text-left px-4 py-3 rounded-2xl border transition-all ${
                      formData.cateringChildrenPackageId === pkg.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-display font-700 text-sm">{pkg.name}</span>
                    <span className="text-xs text-gray-500 ml-2 font-body">{pkg.description}</span>
                    <span className="float-right text-sm font-display font-700 text-brand-500">
                      {formatPrice(pkg.pricePerPerson)}/niño
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Catering adultos */}
            <div>
              <h3 className="font-display font-700 text-gray-800 mb-2">🥗 Catering adultos</h3>
              <div className="space-y-2">
                {catering?.filter((c) => c.type === 'ADULTS').map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        cateringAdultsPackageId:
                          prev.cateringAdultsPackageId === pkg.id ? undefined : pkg.id,
                      }))
                    }
                    className={`w-full text-left px-4 py-3 rounded-2xl border transition-all ${
                      formData.cateringAdultsPackageId === pkg.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-display font-700 text-sm">{pkg.name}</span>
                    <span className="text-xs text-gray-500 ml-2 font-body">{pkg.description}</span>
                    <span className="float-right text-sm font-display font-700 text-brand-500">
                      {formatPrice(pkg.pricePerPerson)}/adulto
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Extras */}
            {extras && extras.length > 0 && (
              <div>
                <h3 className="font-display font-700 text-gray-800 mb-2">✨ Extras</h3>
                <div className="space-y-2">
                  {extras.map((extra) => (
                    <button
                      key={extra.id}
                      onClick={() => {
                        setFormData((prev) => {
                          const ids = prev.extraIds ?? []
                          return {
                            ...prev,
                            extraIds: ids.includes(extra.id)
                              ? ids.filter((id) => id !== extra.id)
                              : [...ids, extra.id],
                          }
                        })
                      }}
                      className={`w-full text-left px-4 py-3 rounded-2xl border transition-all ${
                        formData.extraIds?.includes(extra.id)
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-display font-700 text-sm">{extra.name}</span>
                      <span className="float-right text-sm font-display font-700 text-brand-500">
                        {formatPrice(extra.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">
              <ChevronLeft size={16} /> Atrás
            </button>
            <button onClick={() => setStep(3)} className="btn-primary flex-1">
              Ver resumen <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Resumen y confirmación ── */}
      {step === 3 && (
        <div className="card">
          <h2 className="text-2xl font-display font-800 text-gray-900 mb-6">Revisá tu solicitud</h2>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-gray-500">Nombre</span>
                <span className="font-600 text-gray-800">{formData.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Teléfono</span>
                <span className="font-600 text-gray-800">{formData.clientPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Evento</span>
                <span className="font-600 text-gray-800 capitalize">{formData.eventType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fecha</span>
                <span className="font-600 text-gray-800">{formData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Niños / Adultos</span>
                <span className="font-600 text-gray-800">{formData.childrenCount} / {formData.adultCount}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 font-body text-center bg-accent-400/10 rounded-2xl p-3">
              El presupuesto final se calcula en el servidor y te será confirmado por WhatsApp.
              <br />No se realizan pagos online.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">
              <ChevronLeft size={16} /> Atrás
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary flex-1"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <><Loader2 size={16} className="animate-spin" /> Enviando...</>
              ) : (
                <>Enviar solicitud <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
