import { prisma } from "../../utils/prisma";

export class LoginRepository {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async saveRefreshToken(userId: number, token: string, expiresAt: Date) {
    return await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findRefreshToken(token: string) {
    return await prisma.refreshToken.findUnique({
      where: { token },
      include: { 
        user: {
          include: { role: true }
        }
      },
    });
  }
}
