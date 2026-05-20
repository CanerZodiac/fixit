# FixIT — Destek Merkezi

IT Destek ve Biletleme Sistemi. Bilet yönetimi, SLA takibi, bilgi bankası, canlı destek, envanter yönetimi ve raporlama.

## Özellikler

- Bilet Yönetimi (CRUD, durum takibi, SLA)
- Kullanıcı Yönetimi (Admin paneli, rol bazlı erişim)
- Bilgi Bankası (IT makaleleri, arama)
- Canlı Destek Asistanı (AI bilgi tabanı)
- Raporlama ve Analiz
- Envanter Yönetimi
- Bildirim Sistemi
- Tema Özelleştirme (6 renk teması)

## Kurulum

### Gereksinimler
- Node.js 18+

### Adımlar

1. Bağımlılıkları yükle:
```bash
npm install
```

2. Uygulamayı başlat:
```bash
npm run dev
```

3. Tarayıcıda aç: [http://localhost:3000](http://localhost:3000)

### Kurulum Adımları
1. XAMPP ile MySQL başlatın
2. Ana dizindeki `database/fixit_kurulum.sql` dosyasını phpMyAdmin üzerinden İçe Aktar (Import) yapın
3. Projeyi çalıştırmak için ana dizindeki `start.bat` dosyasına tıklayın
4. Projeyi sonlandırmak için `kapat.bat` dosyasına tıklayın

### 🔐 Giriş Hesapları (DevSecOps)

Siber güvenlik önlemleri gereği sistem default olarak sadece yetkili yöneticiyi tanır:

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Admin Ana Yetkili | admin@fixit.com | 1234 |

*(Diğer tüm personeller Kayıt Ol ekranından hesap oluşturmalı ve hesaplarına gelen E-Posta onay koduyla sistemlerini doğrulamalıdır)*

## Teknolojiler

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, Express, MySQL
- **UI:** Custom HUD tasarım sistemi
- **State:** React Context + localStorage
