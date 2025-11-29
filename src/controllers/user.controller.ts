import { Elysia, t } from 'elysia'
import { UserService } from '../services/user.service'
import { successResponse, errorResponse, createdResponse, updatedResponse, deletedResponse } from '../utils/response'

const userService = new UserService()

export const userController = new Elysia({ prefix: '/api/users' })
  // GET all users
  .get('/', async () => {
    try {
      const users = await userService.getAllUsers()
      return successResponse(users)
    } catch (error: any) {
      return errorResponse(error.message)
    }
  }, {
    detail: {
      tags: ['User'],
      summary: 'Get all users',
      description: 'Retrieve all users from database'
    }
  })

  // GET user by ID
  .get('/:id', async ({ params: { id } }) => {
    try {
      const user = await userService.getUserById(Number(id))
      return successResponse(user)
    } catch (error: any) {
      return errorResponse(error.message)
    }
  }, {
    detail: {
      tags: ['User'],
      summary: 'Get user by ID',
      description: 'Retrieve a single user by ID'
    },
    params: t.Object({
      id: t.String()
    })
  })

  // CREATE user
  .post('/', async ({ body }) => {
    try {
      const user = await userService.createUser(body as any)
      return createdResponse(user, 'User created successfully')
    } catch (error: any) {
      return errorResponse(error.message)
    }
  }, {
    detail: {
      tags: ['User'],
      summary: 'Create new user',
      description: 'Create a new user in the database'
    },
    body: t.Object({
      email: t.String({ format: 'email' }),
      name: t.String(),
      password: t.String(),
      phone: t.Optional(t.String()),
      avatar: t.Optional(t.String())
    })
  })

  // UPDATE user
  .put('/:id', async ({ params: { id }, body }) => {
    try {
      const user = await userService.updateUser(Number(id), body)
      return updatedResponse(user, 'User updated successfully')
    } catch (error: any) {
      return errorResponse(error.message)
    }
  }, {
    detail: {
      tags: ['User'],
      summary: 'Update user',
      description: 'Update an existing user by ID'
    },
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      email: t.Optional(t.String({ format: 'email' })),
      name: t.Optional(t.String()),
      password: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      avatar: t.Optional(t.String())
    })
  })

  // DELETE user
  .delete('/:id', async ({ params: { id } }) => {
    try {
      await userService.deleteUser(Number(id))
      return deletedResponse('User deleted successfully')
    } catch (error: any) {
      return errorResponse(error.message)
    }
  }, {
    detail: {
      tags: ['User'],
      summary: 'Delete user',
      description: 'Delete a user by ID'
    },
    params: t.Object({
      id: t.String()
    })
  })
