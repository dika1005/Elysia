import { LogoutRepository } from "../../repositories/auth/logout.repository";

export class LogoutService {
  private logoutRepository: LogoutRepository;

  constructor() {
    this.logoutRepository = new LogoutRepository();
  }

  async logout(token: string) {
    // Validasi token ada
    const refreshToken = await this.logoutRepository.findRefreshToken(token);
    if (!refreshToken) {
      throw new Error("Refresh token not found");
    }

    // Hapus refresh token
    await this.logoutRepository.deleteRefreshToken(token);

    return { message: "Logout successful" };
  }

  async logoutAll(userId: number) {
    // Hapus semua refresh token user
    await this.logoutRepository.deleteAllRefreshTokensByUserId(userId);

    return { message: "Logout from all devices successful" };
  }
}
