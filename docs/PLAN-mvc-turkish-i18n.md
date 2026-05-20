# IT Destek Sistemi - MVC Formasyonu, Türkçe Kod Mimarisi & Dil Seçeneği (i18n)

## 🎯 Projenin Amacı
Dağınık olan kod dizinini evrensel MVC (Model-View-Controller) standartlarında toparlamak, tüm dosya ve bileşen (component) adlarını/sınıflarını Türkçe'ye çevirmek ve uygulamaya "İngilizce / Türkçe" geçiş (Çoklu dil / i18n) desteği eklemek.

## 🔴 Kritik Sokratik Sorular (Kullanıcı Onayı Bekleniyor)
> [!WARNING]
> Bu sorulara vereceğiniz yanıt, mimarinin temelini oluşturacaktır. Lütfen uygulamaya geçmeden önce bu 3 soruyu netleştirelim:

1. **Kod Türkçeleştirme:** Web dünyasında *Kullanıcının* ekranı Türkçe görmesi ile *Yazılımcının* kod dosyalarını Türkçe yapması farklıdır. `pages/SettingsPage.tsx` dosyasının adını `sayfalar/AyarlarSayfasi.tsx` olarak, kod içindeki `<Dashboard />` bileşenini `<KontrolPaneli />` olarak baştan aşağı çevirmemi kesinlikle istiyor musunuz? (Bu, piyasada nadir görülen spesifik bir tercihtir ve eğer kurumsal satışta kodları Türk yazılımcılara teslim edecekseniz yerinde olabilir). Yoksa sadece **Kullanıcı Ekranı** mı Türkçe olacak?
2. **MVC Klasör Yapısı:** React projelerinde saf MVC olmaz, ancak Node.js (Backend) için tam bir MVC kurgulayabilirim (`server/models`, `server/controllers`, `server/routes`). React (Önyüz) dosyalarını ise ana dizin karmaşasından kurtarıp tek bir `frontend/src/` klasörü altına toplamayı (Clean Architecture) öneriyorum. Onaylıyor musunuz?
3. **Dil Desteği (İngilizce/Türkçe):** Projede çoklu dil desteği yaparken React için endüstri standardı olan `i18next` kütüphanesini sisteminize kurup bir `Dil Değiştir (TR/EN)` butonu ekleyeceğim. Uygun mudur?

---

## 🛠️ Planlanan Değişiklikler (Klasör Mimarisi Önerisi)

### 1️⃣ Yeni Dosya Mimarisi (Clean Architecture + MVC)
Tüm root (ana dizin) karmaşası sonlandırılacak:

**Öncesi (Şu Anki Karmaşa):**
```text
/pages
/components
/hooks
/server (Tamamı index.js içinde)
App.tsx
index.tsx
```

**Sonrası (Hedeflenen Temiz Yapı):**
```text
/backend (Node.js MVC)
    /modeller (Models - Veritabanı şemaları)
    /kontrolculer (Controllers - İş mantığı)
    /rotalar (Routes - Endpoint yönlendirmeleri)
    /guvenlik (Middlewares - Auth)
    sunucu.js (Eski index.js)

/frontend (React UI)
    /src
        /sayfalar (Eski pages)
        /bilesenler (Eski components)
        /kancalar (Eski hooks)
        /diller (i18n Klasörü)
        Uygulama.tsx (Eski App.tsx)
```

### 2️⃣ Dosya Adları ve Kod Değişimi Geçiş Algoritması
Projede varolan her bir `.tsx` ve `.ts` dosyasında yer alan İngilizce component isimleri "Bul & Değiştir" yapılarak tamamen Türkçe isimlendirilecek.
*Örnek:* `TicketListPage` -> `BiletListesiSayfasi`

### 3️⃣ Çoklu Dil (i18n) Entegrasyonu
Çeviriler sabit JSON dosyalarına aktarılacak (`tr.json`, `en.json`).
Header'ın sağ üst köşesine Bayrak veya Dil seçici eklenecek. Seçilen dil `localStorage` üzerine kaydedilerek kullanıcının tercihi hatırlanacak.

---

## 📋 Nasıl Doğrulayacağız (Verification Plan)
1. Düzenlenen klasör hiyerarşisinden sonra `start.bat` güncellenerek projenin yeni klasör yolundan `Vite` ve `Node` ile 0 hatayla ayağa kalkması.
2. Tüm menü uçlarında (Sayfalara tıkladığınızda) yolların kırılmadığını kontrol etmek.
3. Sağ üstteki Dil değiştiriciye basıldığında Form başlıklarının anında İngilizceye dönmesi.
