import { RegisterRepository } from "../../repositories/auth/register.repository";
import bcrypt from "bcryptjs";

export class RegisterService {
  private registerRepository: RegisterRepository;

  constructor() {
    this.registerRepository = new RegisterRepository();
  }

  async register(data: {
    email: string;
    name: string;
    password: string;
    phone?: string;
    avatar?: string;
  }) {
    const existingUser = await this.registerRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("email sudah terdaftar");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.registerRepository.createUser({
      ...data,
      password: hashedPassword,
    });

    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}
