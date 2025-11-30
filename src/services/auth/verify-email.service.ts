import { prisma } from '../../utils/prisma'
import { TokenGenerator } from '../../utils/token'
import { EmailService } from '../email.service'

export class VerifyEmailService {
  private emailService: EmailService

  constructor() {
    this.emailService = new EmailService()
  }

  async verifyEmail(token: string) {
    // Cari temporary user dengan token ini
    const tempUser = await prisma.temporaryUser.findUnique({
      where: { verificationToken: token }
    })

    if (!tempUser) {
      throw new Error('Invalid verification token')
    }

    // Cek apakah token sudah expired
    if (TokenGenerator.isTokenExpired(tempUser.expiresAt)) {
      throw new Error('Verification token has expired. Please register again.')
    }

    // Cek apakah email sudah terdaftar di User aktif (double check)
    const existingUser = await prisma.user.findUnique({
      where: { email: tempUser.email }
    })

    if (existingUser) {
      // Email sudah verified sebelumnya, hapus temporary user
      await prisma.temporaryUser.delete({
        where: { id: tempUser.id }
      })
      throw new Error('Email already verified. You can login now.')
    }

    // Pindahkan data dari TemporaryUser ke User table
    const newUser = await prisma.user.create({
      data: {
        email: tempUser.email,
        name: tempUser.name,
        password: tempUser.password,
        phone: tempUser.phone,
        avatar: tempUser.avatar,
        emailVerifiedAt: new Date(),
        roleId: 2 // default role: user
      }
    })

    // Hapus temporary user setelah berhasil dipindahkan
    await prisma.temporaryUser.delete({
      where: { id: tempUser.id }
    })

    console.log(`✅ User ${newUser.email} moved to active users table`)

    return {
      message: 'Email verified successfully! You can now login.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    }
  }

  async resendVerification(email: string) {
    // Cari temporary user by email
    const tempUser = await prisma.temporaryUser.findUnique({
      where: { email }
    })

    if (!tempUser) {
      throw new Error('User not found or already verified')
    }

    // Generate token baru
    const token = TokenGenerator.generateVerificationToken()
    const expiresAt = TokenGenerator.generateTokenExpiry(24)

    // Update token di temporary user
    await prisma.temporaryUser.update({
      where: { id: tempUser.id },
      data: {
        verificationToken: token,
        expiresAt
      }
    })

    // Kirim email verifikasi baru
    await this.emailService.sendVerificationEmail(
      tempUser.email,
      token,
      tempUser.name
    )

    console.log(`✅ Resent verification email to ${tempUser.email}`)

    return {
      message: 'Verification email has been resent. Please check your inbox.'
    }
  }
}