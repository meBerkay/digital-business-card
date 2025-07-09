import { NextRequest, NextResponse } from "next/server"
import { MonetoliaService } from "@/lib/moneytolia"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const monetoliaService = new MonetoliaService()

    // Verify callback authenticity
    const isValid = monetoliaService.verifyCallback(body)
    
    if (!isValid) {
      console.error("Invalid Moneytolia callback signature")
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    const { order_id, status, amount } = body

    // Find the order
    const order = await prisma.order.findUnique({
      where: { orderNumber: order_id }
    })

    if (!order) {
      console.error(`Order not found: ${order_id}`)
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Update order status based on payment result
    let orderStatus = "pending"
    let paymentStatus = "pending"

    switch (status) {
      case "success":
      case "paid":
        orderStatus = "confirmed"
        paymentStatus = "paid"
        break
      case "failed":
      case "error":
        orderStatus = "failed"
        paymentStatus = "failed"
        break
      case "cancelled":
        orderStatus = "cancelled"
        paymentStatus = "cancelled"
        break
      default:
        orderStatus = "pending"
        paymentStatus = "pending"
    }

    // Update the order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: orderStatus,
        paymentStatus: paymentStatus,
        updatedAt: new Date()
      }
    })

    console.log(`Order ${order_id} updated: ${orderStatus}/${paymentStatus}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Moneytolia callback error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

