export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly error: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static badRequest(message: string) {
    return new ApiError(400, 'BAD_REQUEST', message)
  }

  static unauthorized(message = 'No autorizado') {
    return new ApiError(401, 'UNAUTHORIZED', message)
  }

  static notFound(message: string) {
    return new ApiError(404, 'NOT_FOUND', message)
  }

  static conflict(message: string) {
    return new ApiError(409, 'CONFLICT', message)
  }

  static internal(message = 'Error interno del servidor') {
    return new ApiError(500, 'INTERNAL_ERROR', message)
  }
}
