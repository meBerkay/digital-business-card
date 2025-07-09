const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function makeAdmin() {
  try {
    const user = await prisma.user.update({
      where: {
        email: 'test@digikart.com'
      },
      data: {
        role: 'ADMIN'
      }
    })
    
    console.log('User updated to admin:', user)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()

