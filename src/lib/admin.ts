import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { prisma } from "./prisma"

export async function isAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return false
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  return user?.role === "ADMIN"
}

export async function requireAdmin() {
  const adminCheck = await isAdmin()
  
  if (!adminCheck) {
    throw new Error("Admin access required")
  }
  
  return true
}

export async function getAdminStats() {
  const [
    totalUsers,
    totalCards,
    totalOrders,
    pendingOrders,
    thisMonthOrders,
    thisMonthRevenue
  ] = await Promise.all([
    prisma.user.count(),
    prisma.card.count(),
    prisma.order.count(),
    prisma.order.count({
      where: { status: "PENDING" }
    }),
    prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    }),
    prisma.order.aggregate({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        },
        status: {
          in: ["CONFIRMED", "SHIPPED", "DELIVERED"]
        }
      },
      _sum: {
        totalPrice: true
      }
    })
  ])

  return {
    totalUsers,
    totalCards,
    totalOrders,
    pendingOrders,
    thisMonthOrders,
    thisMonthRevenue: thisMonthRevenue._sum.totalPrice || 0
  }
}

