import { prisma } from '../utils/prisma'

export class UserRepository {
  async findAll() {
    return await prisma.user.findMany()
  }

  async findById(id: number) {
    return await prisma.user.findUnique({
      where: { id }
    })
  }

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    })
  }

  async create(data: { email: string; name: string; password: string; phone?: string; avatar?: string }) {
    return await prisma.user.create({
      data
    })
  }

  async update(id: number, data: any) {
    return await prisma.user.update({
      where: { id },
      data
    })
  }

  async delete(id: number) {
    return await prisma.user.delete({
      where: { id }
    })
  }
}
