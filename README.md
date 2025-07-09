# DigiKart 🚀

<div align="center">
  <img src="https://via.placeholder.com/200x200/3B82F6/FFFFFF?text=DigiKart" alt="DigiKart Logo" width="200"/>
  
  <h3>Modern Dijital Kartvizit Platformu</h3>
  <p>Geleneksel kartvizitlerin dijital çağdaki karşılığı - Moneytolia ödeme entegrasyonu ile</p>

  ![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?style=for-the-badge&logo=next.js)
  ![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
  ![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma)
  ![Moneytolia](https://img.shields.io/badge/Moneytolia-Payment-FF6B35?style=for-the-badge)
  ![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)

</div>

---

## 🌟 Özellikler

### 💳 Dijital Kartvizit Yönetimi
- **Kişiselleştirilebilir Tasarımlar**: Modern, klasik ve minimal şablonlar
- **QR Kod Entegrasyonu**: Anında paylaşım için otomatik QR kod oluşturma
- **Sosyal Medya Bağlantıları**: LinkedIn, Twitter, Instagram, Facebook entegrasyonu
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm

### 🛒 E-Ticaret & Ödeme Sistemi
- **Moneytolia Entegrasyonu**: Güvenli ve hızlı ödeme işlemleri
- **Fiziksel & Dijital Kartlar**: Çoklu ürün tipi desteği
- **Taksit Seçenekleri**: 3 taksit'e kadar ödeme imkanı
- **Gerçek Zamanlı Sipariş Takibi**: Anlık durum güncellemeleri

### 👨‍💼 Admin Paneli
- **Kapsamlı Dashboard**: Satış, kullanıcı ve sipariş istatistikleri
- **Kullanıcı Yönetimi**: Rol tabanlı erişim kontrolü
- **Sipariş Yönetimi**: Detaylı sipariş takip ve yönetim sistemi
- **Analitik Raporlar**: Gelişmiş veri analizi ve raporlama

### 🔐 Güvenlik & Kimlik Doğrulama
- **NextAuth.js**: Güvenli kullanıcı kimlik doğrulaması
- **JWT Token**: Oturum yönetimi ve güvenlik
- **Role-Based Access**: Admin ve kullanıcı rol ayrımı
- **Secure Payment**: SHA512 HMAC ile güvenli ödeme işlemleri

## 🛠️ Teknoloji Stack

### Frontend
- **Next.js 15.3.5**: React tabanlı full-stack framework
- **React 19**: Modern UI kütüphanesi
- **TypeScript**: Type-safe geliştirme
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Modern ikon seti

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma ORM**: Type-safe database client
- **SQLite**: Hafif ve hızlı veritabanı
- **NextAuth.js**: Kimlik doğrulama sistemi

### Payment & Integration
- **Moneytolia API**: Modern ödeme gateway
- **SHA512 HMAC**: Güvenli API imzalama
- **Webhook Support**: Gerçek zamanlı ödeme bildirimleri
- **Multi-environment**: Test ve production desteği

### DevOps & Deployment
- **Docker**: Containerized deployment
- **Docker Compose**: Multi-service orchestration
- **Production Ready**: Optimized build configuration
- **Environment Management**: Secure configuration handling

## 🚀 Hızlı Başlangıç

### Ön Gereksinimler
- Node.js 18+ 
- Docker & Docker Compose
- Moneytolia Merchant hesabı

### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/yourusername/digikart.git
cd digikart
```

### 2. Environment Variables Ayarlayın
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```env
# Database
DATABASE_URL="file:./data/dev.db"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Moneytolia Payment Gateway
MONEYTOLIA_API_KEY="your-moneytolia-api-key"
MONEYTOLIA_API_SECRET="your-moneytolia-api-secret"
```

### 3. Docker ile Çalıştırın
```bash
# Development
docker compose up --build -d

# Production
docker compose -f docker-compose.prod.yml up --build -d
```

### 4. Database'i Initialize Edin
```bash
docker exec -it digikart_app npx prisma db push
```

### 5. Admin Kullanıcısı Oluşturun
```bash
# Web arayüzünden kayıt olun: http://localhost:3000
# Sonra admin rolü verin:
docker exec -it digikart_app sh -c "
apk add sqlite && 
sqlite3 data/dev.db \"UPDATE User SET role = 'admin' WHERE email = 'your-email@example.com';\""
```

## 📋 Manuel Kurulum

### 1. Dependencies Yükleyin
```bash
npm install
```

### 2. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 3. Development Server
```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 🔧 Konfigürasyon

### Moneytolia Ayarları

#### API Credentials
Moneytolia panelinden API bilgilerinizi alın:
- **API Key**: Merchant panelinden alınan API anahtarı
- **API Secret**: Güvenli imzalama için secret key

#### Webhook URLs
Moneytolia panelinde aşağıdaki URL'leri ayarlayın:
```
Callback URL: https://yourdomain.com/api/payment/moneytolia/callback
Success URL: https://yourdomain.com/order/success
Fail URL: https://yourdomain.com/order/fail
```

#### Test Environment
Development için sandbox kullanın:
```env
NODE_ENV=development  # Otomatik olarak sandbox kullanır
```

### Database Konfigürasyonu

#### SQLite (Default)
```env
DATABASE_URL="file:./data/dev.db"
```

#### PostgreSQL (Production)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/digikart"
```

### Authentication Setup

#### NextAuth.js Secret
```bash
# Güvenli secret oluşturun
openssl rand -base64 32
```

## 📊 API Dokümantasyonu

### Authentication Endpoints

#### POST `/api/auth/signin`
Kullanıcı girişi
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/signup`
Kullanıcı kaydı
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Card Management

#### GET `/api/cards`
Kullanıcının kartlarını listele
```bash
curl -H "Authorization: Bearer <token>" \
     https://yourdomain.com/api/cards
```

#### POST `/api/cards`
Yeni kart oluştur
```json
{
  "name": "John Doe",
  "title": "Software Developer",
  "company": "Tech Corp",
  "email": "john@techcorp.com",
  "phone": "+90 555 123 4567",
  "template": "modern",
  "primaryColor": "#3B82F6"
}
```

### Order Management

#### POST `/api/orders`
Yeni sipariş oluştur
```json
{
  "cardId": "card-id",
  "quantity": 1,
  "unitPrice": 29.99,
  "productType": "physical_card",
  "customerInfo": {
    "name": "Customer Name",
    "email": "customer@example.com",
    "phone": "+90 555 987 6543"
  },
  "shippingAddress": {
    "address": "Atatürk Mah. Cumhuriyet Cad. No:1",
    "city": "İstanbul",
    "postalCode": "34000"
  },
  "acceptedTerms": true,
  "acceptedPrivacyPolicy": true
}
```

Response:
```json
{
  "id": "order-id",
  "orderNumber": "DK1234567890",
  "status": "payment_pending",
  "payment_url": "https://payment.moneytolia.com/pay/xxx"
}
```

### Payment Callbacks

#### POST `/api/payment/moneytolia/callback`
Moneytolia ödeme bildirimi (Webhook)
```json
{
  "order_id": "DK1234567890",
  "status": "success",
  "amount": "29.99",
  "currency": "TRY",
  "hash": "signature-hash"
}
```

### Admin Endpoints

#### GET `/api/admin/stats`
Admin dashboard istatistikleri
```json
{
  "totalUsers": 150,
  "totalOrders": 89,
  "totalRevenue": 2670.11,
  "pendingOrders": 5
}
```

## 🧪 Test

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Payment Testing
Moneytolia test kartları:
```
Kart No: 4508 0345 0803 4509
CVV: 000
Tarih: 12/26
```

## 🚀 Deployment

### Docker Production
```bash
# Production build
docker compose -f docker-compose.prod.yml up --build -d

# SSL sertifikası ile
docker compose -f docker-compose.ssl.yml up --build -d
```

### Vercel Deployment
```bash
# Vercel CLI ile
npm i -g vercel
vercel --prod

# Environment variables ayarlayın:
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
# - MONEYTOLIA_API_KEY
# - MONEYTOLIA_API_SECRET
```

### Environment Checklist
- [ ] Database URL configured
- [ ] Moneytolia API credentials set
- [ ] NextAuth secret generated
- [ ] Webhook URLs configured
- [ ] SSL certificate installed
- [ ] Domain DNS configured

## 🔍 Troubleshooting

### Yaygın Sorunlar

#### Database Connection Error
```bash
# Database dosyasının varlığını kontrol edin
ls -la data/dev.db

# Permissions kontrol edin
chmod 755 data/
chmod 644 data/dev.db
```

#### Moneytolia API Error
```bash
# API credentials kontrol edin
echo $MONEYTOLIA_API_KEY
echo $MONEYTOLIA_API_SECRET

# Network connectivity test
curl -I https://sandboxmerchantapi.moneytolia.com/api/
```

#### Payment Callback Issues
```bash
# Webhook URL'ini kontrol edin
curl -X POST https://yourdomain.com/api/payment/moneytolia/callback \
     -H "Content-Type: application/json" \
     -d '{"test": true}'

# Logs kontrol edin
docker compose logs -f digikart_app
```

### Debug Mode
```bash
# Development mode ile detaylı loglar
NODE_ENV=development npm run dev

# Database queries görmek için
DATABASE_LOGGING=true npm run dev
```

## 🤝 Katkıda Bulunma

### Development Setup
1. Fork repository
2. Feature branch oluşturun: `git checkout -b feature/amazing-feature`
3. Değişikliklerinizi commit edin: `git commit -m 'Add amazing feature'`
4. Branch'i push edin: `git push origin feature/amazing-feature`
5. Pull Request açın

### Code Style
```bash
# ESLint
npm run lint

# Prettier
npm run format

# Type checking
npm run type-check
```

### Commit Convention
```
feat: add new payment method
fix: resolve callback timeout issue
docs: update API documentation
style: format code with prettier
refactor: optimize database queries
test: add payment integration tests
```

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

- **Geliştirici**: Berkay Can Ö.
- **GitHub**: [@meberkay](https://github.com/meberkay)
- **LinkedIn**: [LinkedIn](https://linkedin.com/in/berkaycanozkaradayi)

  
## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://prisma.io/) - Database toolkit
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Moneytolia](https://moneytolia.com/) - Payment gateway
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Lucide](https://lucide.dev/) - Icon library

---

<div align="center">
  <p>⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!</p>
  <p>Made with ❤️ by <a href="https://github.com/meberkay">Berkay Can Ö. </a></p>
</div>

