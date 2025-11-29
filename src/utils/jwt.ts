export const jwtConfig = {
    secret: process.env.JWT_SECRET || 'your-super-secret-key',
    accessTokenExpiry: '15m' as string, // 15 menit
    refreshTokenExpiry: '20m' as string // 20 menit
}

export interface JWTPayload {
    id: number
    email: string
    name: string
    role: string
}