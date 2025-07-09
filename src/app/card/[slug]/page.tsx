"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

interface CardPageProps {
  params: {
    slug: string
  }
}

interface Card {
  id: string
  name: string
  title?: string
  company?: string
  email?: string
  phone?: string
  website?: string
  address?: string
  bio?: string
  linkedin?: string
  twitter?: string
  instagram?: string
  facebook?: string
  template: string
  primaryColor: string
  secondaryColor: string
  slug: string
  isActive: boolean
  isPublic: boolean
  qrCode?: string
  user: {
    name: string
  }
}

export default function CardPage({ params }: CardPageProps) {
  const [card, setCard] = useState<Card | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const response = await fetch(`/api/cards/${params.slug}`)
        if (response.ok) {
          const cardData = await response.json()
          setCard(cardData)
        } else {
          setCard(null)
        }
      } catch (error) {
        console.error("Error fetching card:", error)
        setCard(null)
      } finally {
        setLoading(false)
      }
    }

    fetchCard()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!card) {
    notFound()
  }

  const socialLinks = [
    { name: "LinkedIn", url: card.linkedin, icon: "linkedin" },
    { name: "Twitter", url: card.twitter, icon: "twitter" },
    { name: "Instagram", url: card.instagram, icon: "instagram" },
    { name: "Facebook", url: card.facebook, icon: "facebook" },
  ].filter(link => link.url)

  const handleSaveContact = () => {
    // Create vCard data
    const vCard = `BEGIN:VCARD\nVERSION:3.0\nFN:${card.name}\n${card.title ? `TITLE:${card.title}` : ""}\n${card.company ? `ORG:${card.company}` : ""}\n${card.email ? `EMAIL:${card.email}` : ""}\n${card.phone ? `TEL:${card.phone}` : ""}\n${card.website ? `URL:${card.website}` : ""}\n${card.address ? `ADR:;;${card.address};;;;` : ""}\n${card.bio ? `NOTE:${card.bio}` : ""}\nEND:VCARD`

    const blob = new Blob([vCard], { type: "text/vcard" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${card.name.replace(/\s+/g, "_")}.vcf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Card Container */}
        <div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${card.primaryColor}20 0%, ${card.secondaryColor}20 100%)`
          }}
        >
          {/* Header Section */}
          <div 
            className="px-8 py-12 text-center text-white relative"
            style={{
              background: `linear-gradient(135deg, ${card.primaryColor} 0%, ${card.secondaryColor} 100%)`
            }}
          >
            {/* Profile Image Placeholder */}
            <div className="w-32 h-32 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>

            <h1 className="text-3xl font-bold mb-2">{card.name}</h1>
            {card.title && <p className="text-xl text-white/90 mb-1">{card.title}</p>}
            {card.company && <p className="text-lg text-white/80">{card.company}</p>}
          </div>

          {/* Contact Information */}
          <div className="px-8 py-8">
            <div className="space-y-4">
              {card.email && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">E-posta</p>
                    <a href={`mailto:${card.email}`} className="text-gray-900 hover:text-indigo-600">
                      {card.email}
                    </a>
                  </div>
                </div>
              )}

              {card.phone && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <a href={`tel:${card.phone}`} className="text-gray-900 hover:text-indigo-600">
                      {card.phone}
                    </a>
                  </div>
                </div>
              )}

              {card.website && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a href={card.website} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-indigo-600">
                      {card.website}
                    </a>
                  </div>
                </div>
              )}

              {card.address && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Adres</p>
                    <p className="text-gray-900">{card.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bio */}
            {card.bio && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Hakkında</h3>
                <p className="text-gray-700 leading-relaxed">{card.bio}</p>
              </div>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sosyal Medya</h3>
                <div className="flex space-x-4">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                      title={link.name}
                    >
                      <span className="text-sm font-medium text-gray-600">
                        {link.name.charAt(0)}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* QR Code */}
            {card.qrCode && (
              <div className="mt-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">QR Kod</h3>
                <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
                  <Image
                    src={card.qrCode}
                    alt="QR Kod"
                    width={150}
                    height={150}
                    className="mx-auto"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Bu QR kodu tarayarak kartviziti paylaşabilirsiniz
                </p>
              </div>
            )}

            {/* Save Contact Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleSaveContact}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Rehbere Kaydet
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Bu kartvizit <Link href="/" className="text-indigo-600 hover:text-indigo-700">DigiKart</Link> ile oluşturulmuştur
          </p>
        </div>
      </div>
    </div>
  )
}


