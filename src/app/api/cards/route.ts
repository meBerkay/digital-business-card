import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import QRCode from "qrcode"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const cards = await prisma.card.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(cards)
  } catch (error) {
    console.error("Error fetching cards:", error)
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
      name,
      title,
      company,
      email,
      phone,
      website,
      address,
      bio,
      linkedin,
      twitter,
      instagram,
      facebook,
      template,
      primaryColor,
      secondaryColor
    } = body

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: "İsim gereklidir" },
        { status: 400 }
      )
    }

    // Generate unique slug
    const baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    
    let slug = baseSlug
    let counter = 1
    
    while (await prisma.card.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const card = await prisma.card.create({
      data: {
        userId: session.user.id,
        name,
        title,
        company,
        email,
        phone,
        website,
        address,
        bio,
        linkedin,
        twitter,
        instagram,
        facebook,
        template: template || "modern",
        primaryColor: primaryColor || "#3B82F6",
        secondaryColor: secondaryColor || "#1F2937",
        slug,
        isActive: true,
        isPublic: true
      }
    })

    // Generate QR Code
    try {
      const cardUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/card/${card.slug}`
      const qrCodeDataURL = await QRCode.toDataURL(cardUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      // Save QR code as file
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }

      const qrCodeFileName = `qr-${card.id}.png`
      const qrCodePath = path.join(uploadsDir, qrCodeFileName)
      const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '')
      fs.writeFileSync(qrCodePath, base64Data, 'base64')

      // Update card with QR code path
      const updatedCard = await prisma.card.update({
        where: { id: card.id },
        data: { qrCode: `/uploads/${qrCodeFileName}` }
      })

      return NextResponse.json(updatedCard, { status: 201 })
    } catch (qrError) {
      console.error("QR Code generation error:", qrError)
      // Return card even if QR generation fails
      return NextResponse.json(card, { status: 201 })
    }
  } catch (error) {
    console.error("Error creating card:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}



