import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { MonetoliaService } from "@/lib/moneytolia"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        card: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      cardId,
      quantity = 1,
      unitPrice,
      productType = "physical_card",
      shippingAddress,
      paymentMethod = "moneytolia",
      customerInfo,
      acceptedTerms,
      acceptedPrivacyPolicy
    } = body

    // Validation
    if (!cardId) {
      return NextResponse.json(
        { error: "Kartvizit seçimi gereklidir" },
        { status: 400 }
      )
    }

    if (!unitPrice || unitPrice <= 0) {
      return NextResponse.json(
        { error: "Geçerli bir fiyat gereklidir" },
        { status: 400 }
      )
    }

    if (!acceptedTerms) {
      return NextResponse.json(
        { error: "Mesafeli satış sözleşmesini kabul etmelisiniz" },
        { status: 400 }
      )
    }

    if (!acceptedPrivacyPolicy) {
      return NextResponse.json(
        { error: "Gizlilik politikasını kabul etmelisiniz" },
        { status: 400 }
      )
    }

    if (!customerInfo?.name || !customerInfo?.email || !customerInfo?.phone) {
      return NextResponse.json(
        { error: "Müşteri bilgileri eksik" },
        { status: 400 }
      )
    }

    // Calculate total price
    const totalPrice = quantity * unitPrice

    // Generate order number
    const orderNumber = `DK${Date.now()}`

    // Get card details
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      select: { name: true, slug: true }
    })

    if (!card) {
      return NextResponse.json(
        { error: "Kartvizit bulunamadı" },
        { status: 404 }
      )
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        cardId,
        orderNumber,
        status: "pending",
        productType,
        quantity,
        unitPrice,
        totalPrice,
        currency: "TRY",
        paymentStatus: "pending",
        paymentMethod,
        shippingAddress
      },
      include: {
        card: {
          select: {
            name: true,
            slug: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Integrate with Moneytolia for payment processing
    try {
      const monetoliaService = new MonetoliaService()
      const clientIp = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      '127.0.0.1'

      const paymentResult = await monetoliaService.createPayment({
        userIp: clientIp,
        orderId: orderNumber,
        email: customerInfo.email,
        amount: totalPrice,
        firstName: customerInfo.name.split(' ')[0] || customerInfo.name,
        lastName: customerInfo.name.split(' ').slice(1).join(' ') || 'Müşteri',
        phone: customerInfo.phone,
        city: shippingAddress?.city || 'İstanbul',
        country: 'Turkey',
        address: shippingAddress?.address || 'Adres bilgisi yok',
        postalCode: shippingAddress?.postalCode || '34000',
        basketItems: [{
          name: `${card.name} - ${productType === 'physical_card' ? 'Fiziksel' : 'Dijital'} Kartvizit`,
          description: `${quantity} adet ${productType === 'physical_card' ? 'fiziksel' : 'dijital'} kartvizit`,
          category: 'Kartvizit',
          quantity: quantity,
          unitPrice: unitPrice
        }],
        okUrl: `${process.env.NEXTAUTH_URL}/order/success?order=${orderNumber}`,
        failUrl: `${process.env.NEXTAUTH_URL}/order/fail?order=${orderNumber}`
      })

      if (paymentResult.success && paymentResult.payment_url) {
        // Update order with payment URL
        await prisma.order.update({
          where: { id: order.id },
          data: { 
            status: "payment_pending",
            paymentId: orderNumber // Store order number as payment reference
          }
        })

        return NextResponse.json({
          ...order,
          payment_url: paymentResult.payment_url
        }, { status: 201 })
      } else {
        // Payment creation failed, update order status
        await prisma.order.update({
          where: { id: order.id },
          data: { 
            status: "failed",
            paymentStatus: "failed"
          }
        })

        return NextResponse.json(
          { error: paymentResult.error || "Ödeme oluşturulamadı" },
          { status: 400 }
        )
      }
    } catch (paymentError) {
      console.error("Payment creation error:", paymentError)
      
      // Update order status to failed
      await prisma.order.update({
        where: { id: order.id },
        data: { 
          status: "failed",
          paymentStatus: "failed"
        }
      })

      return NextResponse.json(
        { error: "Ödeme sistemi hatası" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}



