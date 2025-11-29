import { UserRepository } from '../repositories/user.repository'

export class UserService {
  private userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  async getAllUsers() {
    return await this.userRepository.findAll()
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }

  async createUser(data: { email: string; name: string; password: string; phone?: string; avatar?: string }) {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new Error('Email already exists')
    }

    return await this.userRepository.create(data)
  }

  async updateUser(id: number, data: any) {
    await this.getUserById(id) // Check if exists
    return await this.userRepository.update(id, data)
  }

  async deleteUser(id: number) {
    await this.getUserById(id) // Check if exists
    return await this.userRepository.delete(id)
  }
}
