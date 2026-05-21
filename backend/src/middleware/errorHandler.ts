import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { ApiError } from '../lib/ApiError'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Error de validación Zod
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Datos inválidos',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
    return
  }

  // Error de API propio
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.error,
      message: err.message,
    })
    return
  }

  // Error genérico
  console.error('[ERROR]', err)
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'Error interno del servidor',
  })
}
