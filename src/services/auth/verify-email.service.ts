import { prisma } from '../../utils/prisma'
import { TokenGenerator } from '../../utils/token'
import { SMTPService } from '../smtp.service' // ← Tambahkan

export class VerifyEmailService {
  private smtpService: SMTPService // ← Tambahkan

  constructor() {
    this.smtpService = new SMTPService() // ← Tambahkan
  }

  async verifyEmail(token: string) {
    // Cari di TemporaryUser
    const tempUser = await prisma.temporaryUser.findUnique({
      where: { verificationToken: token }
    })

    if (!tempUser) {
      throw new Error('Invalid or expired verification token')
    }

    // Cek expiry
    if (TokenGenerator.isTokenExpired(tempUser.expiresAt)) {
      throw new Error('Verification token has expired. Please request a new one.')
    }

    // Tentukan roleId (default: user = 2, kecuali admin@gmail.com)
    const roleId = tempUser.email === 'admin@gmail.com' ? 1 : 2

    // Pindahkan ke User table
    const user = await prisma.user.create({
      data: {
        email: tempUser.email,
        name: tempUser.name,
        password: tempUser.password,
        phone: tempUser.phone,
        avatar: tempUser.avatar,
        roleId,
        emailVerifiedAt: new Date()
      }
    })

    // Hapus dari TemporaryUser
    await prisma.temporaryUser.delete({
      where: { id: tempUser.id }
    })

    console.log('✅ User', user.email, 'moved to active users table')

    return {
      message: 'Email verified successfully! You can now login with full access.'
    }
  }

  async resendVerification(email: string) {
    // Cari di TemporaryUser
    const tempUser = await prisma.temporaryUser.findUnique({
      where: { email }
    })

    if (!tempUser) {
      throw new Error('User not found or already verified')
    }

    // Generate token baru
    const newToken = TokenGenerator.generateVerificationToken()
    const newExpiresAt = TokenGenerator.generateTokenExpiry(24)

    // Update token
    await prisma.temporaryUser.update({
      where: { id: tempUser.id },
      data: {
        verificationToken: newToken,
        expiresAt: newExpiresAt
      }
    })

    // Kirim ulang email via SMTP
    await this.smtpService.sendVerificationEmail(
      tempUser.email,
      newToken,
      tempUser.name
    )

    return {
      message: 'Verification email resent successfully'
    }
  }
}