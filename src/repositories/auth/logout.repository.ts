import  { prisma } from '../../utils/prisma';

export class LogoutRepository {
    async deleteRefreshToken(token: string) {
        return await prisma.refreshToken.delete({
            where: { token },
        });
    }  

async deleteAllRefreshTokensByUserId(userId: number) {
    return await prisma.refreshToken.deleteMany({
        where: { userId },
    });
  }

async findRefreshToken(token: string) {
    return await prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true },
    });
  }
}