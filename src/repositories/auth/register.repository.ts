import { errorResponse } from "./../../utils/response";
import { prisma } from "../../utils/prisma";

export class RegisterRepository {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: {
    email: string;
    name: string;
    password: string;
    phone?: string;
    avatar?: string;
  }) {
    return await prisma.user.create({
      data,
    }); 
  }
}
