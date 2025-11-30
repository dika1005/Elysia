import { prisma } from '../../utils/prisma';
import bcrypt from 'bcryptjs';
import { TokenGenerator } from '../../utils/token';
import { SMTPService } from '../smtp.service'; // ← Ganti dari email.service

export class RegisterService {
  private smtpService: SMTPService; // ← Ganti

  constructor() {
    this.smtpService = new SMTPService(); // ← Ganti
  }

  async register(data: {
    email: string;
    name: string;
    password: string;
    phone?: string;
    avatar?: string;
  }) {
    // Cek apakah email sudah ada di TemporaryUser
    const existingTemp = await prisma.temporaryUser.findUnique({
      where: { email: data.email }
    });

    if (existingTemp) {
      throw new Error('Email already registered. Please check your email for verification.');
    }

    // Cek apakah email sudah ada di User (sudah verified)
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Email already registered and verified.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Generate verification token
    const verificationToken = TokenGenerator.generateVerificationToken();
    const expiresAt = TokenGenerator.generateTokenExpiry(24); // 24 jam

    // Simpan ke TemporaryUser
    const tempUser = await prisma.temporaryUser.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        phone: data.phone,
        avatar: data.avatar,
        verificationToken,
        expiresAt
      }
    });

    console.log('✅ Temporary user created with token:', verificationToken);

    // Kirim email verifikasi via SMTP
    try {
      await this.smtpService.sendVerificationEmail(
        tempUser.email,
        verificationToken,
        tempUser.name
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Hapus temporary user jika email gagal
      await prisma.temporaryUser.delete({ where: { id: tempUser.id } });
      throw new Error('Failed to send verification email. Please try again.');
    }

    return {
      email: tempUser.email,
      name: tempUser.name,
      message: 'Registration successful! Please check your email to verify your account.'
    };
  }
}
