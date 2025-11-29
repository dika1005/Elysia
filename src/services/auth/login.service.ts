import { LoginRepository } from '../../repositories/auth/login.repository';
import bcrypt from 'bcryptjs';
import { JWTPayload } from '../../utils/jwt';

export class LoginService {
    private loginRepository: LoginRepository

    constructor(){
        this.loginRepository = new LoginRepository()
    }

    async login(email: string, password: string) {
        const user = await this.loginRepository.findByEmail(email)
        if (!user) {
            throw new Error('email atau password salah')
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            throw new Error('email atau password salah')
        }

        if (!user.isActive) {
            throw new Error('akun belum diaktivasi')
        }

        const { password: _, ...userWithoutPassword } = user

        return {
            user: userWithoutPassword,
            payload: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.name
            } as JWTPayload
        }
    }

    async saveRefreshToken(userId: number, token: string) {
        // Refresh token expired dalam 20 menit
        const expiresAt = new Date()
        expiresAt.setMinutes(expiresAt.getMinutes() + 20)

        return await this.loginRepository.saveRefreshToken(userId, token, expiresAt)
    }

    async validateRefreshToken(token: string) {
        const refreshToken = await this.loginRepository.findRefreshToken(token)
        
        if (!refreshToken) {
            throw new Error('Refresh token tidak valid')
        }

        if (new Date() > refreshToken.expiresAt) {
            throw new Error('Refresh token sudah kadaluarsa')
        }

        if (!refreshToken.user.isActive) {
            throw new Error('Akun tidak aktif')
        }

        return {
            user: refreshToken.user,
            payload: {
                id: refreshToken.user.id,
                email: refreshToken.user.email,
                name: refreshToken.user.name,
                role: refreshToken.user.role.name
            } as JWTPayload
        }
    }
}