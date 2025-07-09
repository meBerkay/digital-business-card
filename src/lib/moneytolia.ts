import crypto from 'crypto'

export interface MonetoliaPaymentRequest {
  amount: number
  currency: string
  max_installment: number
  secure: boolean
  pre_auth: boolean
  billing_first_name: string
  billing_last_name: string
  billing_email: string
  billing_phone_number: string
  billing_city: string
  billing_country: string
  billing_address: string
  billing_postal_code: string
  client_ip: string
  locale: string
  ok_url: string
  fail_url: string
  order_id: string
  device_type: string
  basket_items: Array<{
    name: string
    description: string
    category: string
    extra_field: string
    quantity: number
    unit_price: number
  }>
}

export interface MonetoliaCallbackData {
  order_id: string
  status: string
  amount: string
  hash: string
  failed_reason_code?: string
  failed_reason_msg?: string
  test_mode: string
  payment_type: string
  currency: string
  payment_amount: string
}

export class MonetoliaService {
  private apiKey: string
  private apiSecret: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.MONEYTOLIA_API_KEY || ''
    this.apiSecret = process.env.MONEYTOLIA_API_SECRET || ''
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://merchantapi.moneytolia.com/api'
      : 'https://sandboxmerchantapi.moneytolia.com/api'
  }

  private createSignature(data: string): string {
    const hmacDigest = crypto.createHmac('sha512', this.apiSecret).update(data).digest()
    const signature = hmacDigest.toString('hex')
    const signParams = `api_key=${this.apiKey}&sign=${signature}`
    return Buffer.from(signParams).toString('base64')
  }

  async createPayment(data: {
    userIp: string
    orderId: string
    email: string
    amount: number
    firstName: string
    lastName: string
    phone: string
    city: string
    country: string
    address: string
    postalCode: string
    basketItems: Array<{name: string, description: string, category: string, quantity: number, unitPrice: number}>
    okUrl: string
    failUrl: string
  }): Promise<{ success: boolean, payment_url?: string, error?: string }> {
    try {
      const paymentData: MonetoliaPaymentRequest = {
        amount: data.amount,
        currency: 'TRY',
        max_installment: 3,
        secure: true,
        pre_auth: false,
        billing_first_name: data.firstName,
        billing_last_name: data.lastName,
        billing_email: data.email,
        billing_phone_number: data.phone,
        billing_city: data.city,
        billing_country: data.country,
        billing_address: data.address,
        billing_postal_code: data.postalCode,
        client_ip: data.userIp,
        locale: 'TR',
        ok_url: data.okUrl,
        fail_url: data.failUrl,
        order_id: data.orderId,
        device_type: 'desktop_web',
        basket_items: data.basketItems.map(item => ({
          name: item.name,
          description: item.description,
          category: item.category,
          extra_field: '',
          quantity: item.quantity,
          unit_price: item.unitPrice
        }))
      }

      const requestBody = JSON.stringify(paymentData)
      const signature = this.createSignature(requestBody)

      const response = await fetch(`${this.baseUrl}/checkout/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': requestBody.length.toString(),
          'X-Signature': signature
        },
        body: requestBody
      })

      const result = await response.json()
      
      if (result.success) {
        return {
          success: true,
          payment_url: result.payment_url
        }
      } else {
        return {
          success: false,
          error: result.message || 'Ödeme oluşturulamadı'
        }
      }
    } catch (error) {
      console.error('Moneytolia API Error:', error)
      return {
        success: false,
        error: 'API bağlantı hatası'
      }
    }
  }

  async verifyPayment(orderId: string): Promise<{ success: boolean, status?: string, amount?: number, error?: string }> {
    try {
      const requestData = { order_id: orderId }
      const requestBody = JSON.stringify(requestData)
      const signature = this.createSignature(requestBody)

      const response = await fetch(`${this.baseUrl}/transaction/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': requestBody.length.toString(),
          'X-Signature': signature
        },
        body: requestBody
      })

      const result = await response.json()
      
      if (result.success) {
        return {
          success: true,
          status: result.status,
          amount: result.amount
        }
      } else {
        return {
          success: false,
          error: result.message || 'Ödeme durumu alınamadı'
        }
      }
    } catch (error) {
      console.error('Moneytolia Verify Error:', error)
      return {
        success: false,
        error: 'API bağlantı hatası'
      }
    }
  }

  verifyCallback(callbackData: MonetoliaCallbackData): boolean {
    try {
      // Moneytolia callback verification logic
      // This should be implemented based on Moneytolia's callback verification method
      const hashStr = `${callbackData.order_id}${this.apiSecret}${callbackData.status}${callbackData.amount}`
      const hash = crypto.createHmac('sha512', this.apiSecret).update(hashStr).digest('hex')
      
      return hash === callbackData.hash
    } catch (error) {
      console.error('Callback verification error:', error)
      return false
    }
  }
}

