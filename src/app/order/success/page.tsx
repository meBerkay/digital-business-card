"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface Order {
  id: string
  orderNumber: string
  status: string
  totalPrice: number
  quantity: number
  unitPrice: number
  createdAt: string
  user: {
    name: string
    email: string
  }
  card: {
    name: string
    slug: string
  }
}

function OrderSuccessContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOrder = useCallback(async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error fetching order:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }

    const orderId = searchParams.get("orderId")
    if (!orderId) {
      router.push("/dashboard")
      return
    }

    fetchOrder(orderId)
  }, [session, status, router, searchParams, fetchOrder])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!session || !order) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                DigiKart
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Siparişiniz Alındı!</h1>
            <p className="mt-2 text-gray-600">
              Siparişiniz başarıyla oluşturuldu. Sipariş detayları e-posta adresinize gönderildi.
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sipariş Detayları</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Sipariş Numarası</h3>
                <p className="mt-1 text-sm text-gray-900">#{order.orderNumber}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Sipariş Tarihi</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Müşteri</h3>
                <p className="mt-1 text-sm text-gray-900">{order.user.name}</p>
                <p className="text-sm text-gray-500">{order.user.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Durum</h3>
                <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {order.status === "PENDING" ? "Beklemede" : order.status}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Sipariş Öğeleri</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.card.name} - Fiziksel Kartvizit
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.quantity} adet × ₺{order.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    ₺{(order.quantity * order.unitPrice).toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-base font-medium text-gray-900">Toplam Tutar</p>
                  <p className="text-base font-medium text-gray-900">₺{order.totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Sonraki Adımlar</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-blue-600 mr-2">1.</span>
                <span>Siparişiniz üretim sürecine alınacak (1-2 iş günü)</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-blue-600 mr-2">2.</span>
                <span>Kartvizitler basıldıktan sonra kargo ile gönderilecek</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-blue-600 mr-2">3.</span>
                <span>Kargo takip numarası e-posta ile bildirilecek</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-blue-600 mr-2">4.</span>
                <span>Teslimat süresi 3-5 iş günüdür</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">İletişim</h3>
            <p className="text-sm text-gray-600 mb-2">
              Siparişiniz hakkında sorularınız için bizimle iletişime geçebilirsiniz:
            </p>
            <div className="text-sm text-gray-600">
              <p>E-posta: destek@digikart.com</p>
              <p>Telefon: +90 555 123 45 67</p>
              <p>Çalışma Saatleri: Pazartesi-Cuma 09:00-18:00</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Dashboard&apos;a Dön
            </Link>
            <Link
              href="/order"
              className="inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Yeni Sipariş Ver
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <OrderSuccessContent />
    </Suspense>
  )
}


