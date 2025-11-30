import { LoginRepository } from '../../repositories/auth/login.repository';
import bcrypt from 'bcryptjs';
import { JWTPayload } from '../../utils/jwt';
import { prisma } from '../../utils/prisma';

export class LoginService {
    private loginRepository: LoginRepository

    constructor(){
        this.loginRepository = new LoginRepository()
    }

    async login(email: string, password: string) {
        // Cek di User table (verified users)
        let user = await this.loginRepository.findByEmail(email)
        let isTemporary = false

        // Jika tidak ditemukan di User, cek di TemporaryUser
        if (!user) {
            const tempUser = await prisma.temporaryUser.findUnique({
                where: { email }
            })

            if (tempUser) {
                // User ada di temporary, allow login tapi dengan status temporary
                const isPasswordValid = await bcrypt.compare(password, tempUser.password)
                if (!isPasswordValid) {
                    throw new Error('Invalid email or password')
                }

                // Return temporary user info dengan pesan khusus
                return {
                    user: {
                        id: tempUser.id,
                        email: tempUser.email,
                        name: tempUser.name,
                        phone: tempUser.phone,
                        avatar: tempUser.avatar,
                        isTemporary: true
                    },
                    message: 'Your account is pending email verification. Please check your inbox to activate full access.',
                    requiresVerification: true
                }
            }

            throw new Error('Invalid email or password')
        }

        // User ditemukan di User table (verified)
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            throw new Error('Invalid email or password')
        }

        const { password: _, ...userWithoutPassword } = user

        return {
            user: userWithoutPassword,
            payload: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.name
            } as JWTPayload,
            requiresVerification: false
        }
    }

    async saveRefreshToken(userId: number, token: string) {
        const expiresAt = new Date()
        expiresAt.setMinutes(expiresAt.getMinutes() + 20)

        return await this.loginRepository.saveRefreshToken(userId, token, expiresAt)
    }

    async validateRefreshToken(token: string) {
        const refreshToken = await this.loginRepository.findRefreshToken(token)
        
        if (!refreshToken) {
            throw new Error('Invalid refresh token')
        }

        if (new Date() > refreshToken.expiresAt) {
            throw new Error('Refresh token expired')
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