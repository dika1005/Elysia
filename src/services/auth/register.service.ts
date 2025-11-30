import { RegisterRepository } from '../../repositories/auth/register.repository';
import bcrypt from 'bcryptjs';
import { prisma } from '../../utils/prisma';
import { EmailService } from '../email.service';
import { TokenGenerator } from '../../utils/token';

export class RegisterService {
  private registerRepository: RegisterRepository;
  private emailService: EmailService;

  constructor() {
    this.registerRepository = new RegisterRepository();
    this.emailService = new EmailService();
  }

  async register(data: {
    email: string;
    name: string;
    password: string;
    phone?: string;
    avatar?: string;
  }) {
    // Validasi email sudah terdaftar di User aktif
    const existingActiveUser = await prisma.user.findUnique({
      where: { email: data.email }
    });
    if (existingActiveUser) {
      throw new Error('Email already registered');
    }

    // Validasi email sudah terdaftar di TemporaryUser (pending verification)
    const existingTempUser = await prisma.temporaryUser.findUnique({
      where: { email: data.email }
    });
    if (existingTempUser) {
      throw new Error('Email already registered. Please check your email for verification link.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Generate verification token
    const token = TokenGenerator.generateVerificationToken();
    const expiresAt = TokenGenerator.generateTokenExpiry(24); // 24 jam

    // Simpan ke TemporaryUser table
    const tempUser = await prisma.temporaryUser.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        phone: data.phone || null,
        avatar: data.avatar || null,
        verificationToken: token,
        expiresAt
      }
    });

    console.log('✅ Temporary user created with token:', token);

    // Kirim email verifikasi ke email user
    try {
      await this.emailService.sendVerificationEmail(
        tempUser.email,
        token,
        tempUser.name
      );
      console.log('✅ Email sent to:', tempUser.email);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Hapus temporary user jika email gagal
      await prisma.temporaryUser.delete({
        where: { id: tempUser.id }
      });
      throw new Error('Failed to send verification email. Please try again.');
    }

    return {
      email: tempUser.email,
      name: tempUser.name,
      message: 'Registration successful! Please check your email to verify your account.'
    };
  }
}
