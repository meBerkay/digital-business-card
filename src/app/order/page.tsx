"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface Card {
  id: string
  name: string
  slug: string
  price: number
}

function OrderContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [totalPrice, setTotalPrice] = useState(0)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const fetchCardDetails = useCallback(async (cardSlug: string) => {
    try {
      const response = await fetch(`/api/cards/${cardSlug}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedCard(data)
        setTotalPrice(data.price * quantity)
      } else {
        setErrorMessage("Kart bilgileri alınamadı.")
      }
    } catch (error) {
      console.error("Error fetching card details:", error)
      setErrorMessage("Kart bilgileri alınırken bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }, [quantity])

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }

    const cardSlug = searchParams.get("cardSlug")
    if (cardSlug) {
      fetchCardDetails(cardSlug)
    } else {
      setErrorMessage("Sipariş verilecek kart seçilmedi.")
      setLoading(false)
    }
  }, [session, status, router, searchParams, fetchCardDetails])

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value)
    if (newQuantity > 0) {
      setQuantity(newQuantity)
      if (selectedCard) {
        setTotalPrice(selectedCard.price * newQuantity)
      }
    }
  }

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")

    if (!selectedCard) {
      setErrorMessage("Sipariş verilecek kart bulunamadı.")
      setLoading(false)
      return
    }

    // Get form data
    const formData = new FormData(e.target as HTMLFormElement)
    const customerInfo = {
      name: formData.get("customerName") as string,
      email: formData.get("customerEmail") as string,
      phone: formData.get("customerPhone") as string,
    }

    const shippingAddress = {
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      postalCode: formData.get("postalCode") as string,
    }

    const acceptedTerms = formData.get("acceptedTerms") === "on"
    const acceptedPrivacyPolicy = formData.get("acceptedPrivacyPolicy") === "on"

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardId: selectedCard.id,
          quantity,
          unitPrice: selectedCard.price,
          productType: "physical_card",
          customerInfo,
          shippingAddress,
          acceptedTerms,
          acceptedPrivacyPolicy,
          paymentMethod: "moneytolia"
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // If payment URL is provided, redirect to Moneytolia payment page
        if (data.payment_url) {
          window.location.href = data.payment_url
        } else {
          // Fallback to success page
          router.push(`/order/success?orderId=${data.id}`)
        }
      } else {
        setErrorMessage(data.error || "Sipariş oluşturulurken bir hata oluştu.")
      }
    } catch (_) {
      setErrorMessage("Bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

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

  if (!session) {
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Sipariş Oluştur</h1>
            <p className="mt-2 text-gray-600">Sipariş detaylarını kontrol edin ve tamamlayın.</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                {errorMessage}
              </div>
            )}

            {selectedCard ? (
              <form onSubmit={handleOrder} className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sipariş Özeti</h3>
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-gray-900">Kartvizit Adı:</p>
                      <p className="text-sm text-gray-600">{selectedCard.name}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-900">Birim Fiyat:</p>
                      <p className="text-sm text-gray-600">₺{selectedCard.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Adet
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-base font-medium text-gray-900">Toplam Tutar</p>
                    <p className="text-base font-medium text-gray-900">₺{totalPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? "Sipariş Oluşturuluyor..." : "Siparişi Tamamla"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Sipariş detayları yüklenemedi veya kart seçilmedi.</p>
                <Link href="/dashboard" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                  Dashboard&apos;a Dön
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <OrderContent />
    </Suspense>
  )
}


