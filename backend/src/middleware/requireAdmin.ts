import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { ApiError } from '../lib/ApiError'

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw ApiError.unauthorized()
  }

  const token = authHeader.slice(7)
  try {
    jwt.verify(token, process.env.JWT_SECRET!)
    next()
  } catch {
    throw ApiError.unauthorized('Token inválido o expirado')
  }
}
