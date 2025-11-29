import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Buat role admin dan user
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      id: 1,
      name: 'admin'
    }
  })

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      id: 2,
      name: 'user'
    }
  })

  // Buat admin user (admin@gmail.com)
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      name: 'Administrator',
      password: hashedPassword,
      roleId: adminRole.id,
      isActive: true
    }
  })

  console.log('✅ Seed data created:')
  console.log('   - Role: admin (id=1)')
  console.log('   - Role: user (id=2)')
  console.log('   - Admin user: admin@gmail.com / admin123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
