export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public responseBody?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
