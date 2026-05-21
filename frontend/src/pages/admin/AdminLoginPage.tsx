import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Loader2, Lock } from 'lucide-react'
import { adminApi } from '@/api'
import { useAdminAuth } from '@/hooks/useAdminAuth'

const schema = z.object({
  password: z.string().min(1, 'Ingresá la contraseña'),
})

type FormData = z.infer<typeof schema>

export function AdminLoginPage() {
  const navigate = useNavigate()
  const { login } = useAdminAuth()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: adminApi.login,
    onSuccess: ({ token }) => {
      login(token)
      navigate('/admin/dashboard')
    },
    onError: () => {
      setError('password', { message: 'Contraseña incorrecta' })
    },
  })

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-card-hover p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Lock size={20} className="text-brand-500" />
          </div>
          <h1 className="text-2xl font-display font-800 text-gray-900">Panel Admin</h1>
          <p className="text-sm text-gray-400 font-body mt-1">Salón de Eventos Infantiles</p>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d.password))} className="space-y-4">
          <div>
            <label className="label-base">Contraseña</label>
            <input
              {...register('password')}
              type="password"
              className="input-base"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <><Loader2 size={16} className="animate-spin" /> Ingresando...</>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
