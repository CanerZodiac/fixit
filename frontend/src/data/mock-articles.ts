import type { KBArticle } from '../types/common';

export const mockArticles: KBArticle[] = [
    {
        id: 'kb1',
        title: 'VPN Bağlantı Sorunlarını Giderme',
        category: 'Ağ',
        content: `## VPN Bağlantı Sorunlarını Giderme

### Sık Karşılaşılan Sorunlar

**1. Bağlantı kurulamıyor**
- Cisco AnyConnect istemcisinin güncel olduğundan emin olun
- İnternet bağlantınızı kontrol edin
- Güvenlik duvarı veya antivirüs yazılımının VPN'i engellemediğinden emin olun

**2. Bağlantı sık sık kopuyor**
- Ağ adaptörü sürücülerini güncelleyin
- Power Management ayarlarından "Allow the computer to turn off this device" seçeneğini kapatın
- MTU değerini 1400'e düşürmeyi deneyin

**3. Yavaş bağlantı**
- Split tunneling ayarlarını kontrol edin
- Farklı bir VPN sunucusu deneyin
- ISP'nizle bant genişliği sorunlarını görüşün

### Adım Adım Çözüm
1. Cisco AnyConnect'i kapatın
2. Komut satırında \`ipconfig /flushdns\` çalıştırın
3. AnyConnect'i yeniden başlatın
4. Sunucu adresini manuel girin: vpn.sirket.com`,
        author: 'Demo Altı',
        createdAt: '2025-08-15T10:00:00Z',
        updatedAt: '2026-01-20T14:00:00Z',
        views: 234,
        helpful: 45,
        tags: ['vpn', 'ağ', 'cisco', 'bağlantı'],
    },
    {
        id: 'kb2',
        title: 'Active Directory Şifre Sıfırlama Prosedürü',
        category: 'Erişim',
        content: `## Şifre Sıfırlama Prosedürü

### Kullanıcı Self-Servis
1. https://password.sirket.com adresine gidin
2. "Şifremi Unuttum" butonuna tıklayın
3. Kullanıcı adınızı ve kayıtlı telefon numaranızı girin
4. SMS ile gelen kodu doğrulayın
5. Yeni şifrenizi belirleyin

### Şifre Kuralları
- Minimum 12 karakter
- En az 1 büyük harf, 1 küçük harf, 1 rakam, 1 özel karakter
- Son 12 şifre tekrar kullanılamaz
- 90 günde bir değiştirilmeli

### IT Destek ile Sıfırlama
Eğer self-servis çalışmıyorsa:
1. IT Destek hattını arayın: Dahili 1234
2. Kimlik doğrulaması yapılır (TC son 4 hane + doğum tarihi)
3. Geçici şifre verilir, ilk girişte değiştirilmelidir`,
        author: 'Demo İki',
        createdAt: '2025-06-01T09:00:00Z',
        updatedAt: '2025-12-15T16:00:00Z',
        views: 567,
        helpful: 89,
        tags: ['şifre', 'active-directory', 'hesap'],
    },
    {
        id: 'kb3',
        title: 'Yazıcı Kurulumu ve Sorun Giderme',
        category: 'Donanım',
        content: `## Yazıcı Kurulumu

### Ağ Yazıcısı Ekleme
1. Ayarlar > Yazıcılar > Yazıcı Ekle
2. "Ağ yazıcısı ekle" seçin
3. Yazıcı IP adresini girin (IT'den alın)
4. Sürücü otomatik yüklenecektir

### Yaygın Sorunlar
- **Yazıcı bulunamıyor:** Ağ bağlantısını kontrol edin
- **Kağıt sıkışması:** Tepsiyi çıkarın, sıkışan kağıdı yavaşça çekin
- **Kalite düşük:** Toner seviyesini kontrol edin
- **Çevrimdışı görünüyor:** Yazıcıyı yeniden başlatın`,
        author: 'Demo İki',
        createdAt: '2025-04-10T11:00:00Z',
        updatedAt: '2025-11-05T09:00:00Z',
        views: 189,
        helpful: 32,
        tags: ['yazıcı', 'donanım', 'kurulum'],
    },
    {
        id: 'kb4',
        title: 'E-posta İmza Standartları',
        category: 'E-posta',
        content: `## Kurumsal E-posta İmza Standartları

### Standart Format
\`\`\`
Ad Soyad | Unvan
Departman
Şirket Adı A.Ş.
T: +90 2** *** ** ** | D: XXXX
E: ad.soyad@mail.com
W: www.sirket.com
\`\`\`

### Kurallar
- Logo kullanmayın (e-posta boyutunu artırır)
- Sosyal medya linkleri eklemeyin
- Kişisel sloganlar yasaktır
- Font: Calibri 10pt, renk: #333333`,
        author: 'Demo Bir',
        createdAt: '2025-03-01T08:00:00Z',
        updatedAt: '2025-09-10T12:00:00Z',
        views: 312,
        helpful: 21,
        tags: ['e-posta', 'imza', 'standart'],
    },
    {
        id: 'kb5',
        title: 'Bilgisayar Yavaşlama Sorunlarına İlk Müdahale',
        category: 'Yazılım',
        content: `## Bilgisayar Yavaşlama Çözüm Rehberi

### 1. Temel Kontroller
- CPU ve RAM kullanımını Task Manager'dan kontrol edin
- Disk kullanımı %100 ise bu rehberi takip edin

### 2. Hızlı Çözümler
1. Gereksiz başlangıç programlarını devre dışı bırakın
2. Temp dosyalarını temizleyin: Win+R > %temp% > Tümünü sil
3. Disk temizleme çalıştırın
4. Bilgisayarı yeniden başlatın

### 3. IT Desteğe Yönlendirme
Yukarıdaki adımlar çözmezse bilet açın:
- Kategori: Yazılım
- Öncelik: Orta
- Açıklama: Denediğiniz adımları belirtin`,
        author: 'Demo Bir',
        createdAt: '2025-07-20T14:00:00Z',
        updatedAt: '2026-02-01T10:00:00Z',
        views: 445,
        helpful: 67,
        tags: ['performans', 'yavaşlama', 'windows'],
    },
    {
        id: 'kb6',
        title: 'Outlook Yapılandırma ve Sorun Giderme',
        category: 'E-posta',
        content: `## Outlook Yapılandırma Rehberi

### E-posta Hesabı Ekleme (Exchange)
1. Outlook > Dosya > Hesap Ekle
2. E-posta adresinizi girin (ad.soyad@sirket.com)
3. "Gelişmiş seçenekler" > "Hesabımı el ile ayarla"
4. Exchange seçeneğini işaretleyin
5. Sunucu: mail.sirket.com / Bağlantı noktası: 443

### Sık Karşılaşılan Sorunlar

**Outlook açılmıyor / donuyor:**
1. Outlook'u güvenli modda açın: Win+R > \`outlook.exe /safe\`
2. Eklentileri devre dışı bırakın
3. Profili onarın: Denetim Masası > Mail > Profiller

**Takvim senkronizasyonu bozuk:**
1. Çevrimdışı çalışma modunu kapatın
2. Exchange hesabını kaldırıp tekrar ekleyin
3. OST dosyasını silerek yeniden oluşturun

**Çok büyük posta kutusu uyarısı:**
- 50GB kotanız var
- Eski e-postaları arşivleyin (Dosya > Arşiv)
- Silinmiş öğeleri kalıcı olarak temizleyin`,
        author: 'Demo Bir',
        createdAt: '2025-09-12T10:00:00Z',
        updatedAt: '2026-02-20T11:00:00Z',
        views: 398,
        helpful: 78,
        tags: ['outlook', 'e-posta', 'exchange', 'yapılandırma'],
    },
    {
        id: 'kb7',
        title: 'Microsoft Teams Kullanım Rehberi',
        category: 'Yazılım',
        content: `## Microsoft Teams Kullanım Rehberi

### İlk Kurulum
1. teams.microsoft.com'dan veya IT paketi ile kurun
2. Kurumsal hesabınızla giriş yapın
3. İlk açılışta bildirim izni verin

### Toplantı Düzenleme
1. Takvim > Yeni Toplantı
2. Konu, tarih, saat ve katılımcıları girin
3. "Kanal toplantısı" seçeneği ile tüm ekibi davet edebilirsiniz

### Sorun Giderme

**Ses/Mikrofon çalışmıyor:**
- Ayarlar > Cihazlar > Hoparlör ve mikrofon seçin
- Test araması yapın
- Windows Ses ayarlarından Teams'e mikrofon izni verin

**Ekran paylaşımı çalışmıyor:**
- Teams'i admin olarak çalıştırın
- Ayarlar > Uygulama İzinleri > Ekran paylaşımı: Tüm Ekran

**Bildirimler gelmiyor:**
- Ayarlar > Bildirimler > Tümünü etkinleştir
- Windows'ta Odak Yardımı'nı kapatın`,
        author: 'Demo Altı',
        createdAt: '2025-10-05T09:00:00Z',
        updatedAt: '2026-01-15T14:00:00Z',
        views: 521,
        helpful: 93,
        tags: ['teams', 'toplantı', 'iletişim', 'video'],
    },
    {
        id: 'kb8',
        title: 'Windows 11 Güncelleme Yönetimi',
        category: 'Yazılım',
        content: `## Windows 11 Güncelleme Rehberi

### Kurumsal Güncelleme Politikası
- Güncellemeler WSUS sunucusu üzerinden yönetilir
- Kritik güvenlik yamaları 48 saat içinde uygulanır
- Özellik güncellemeleri IT onayından sonra gelir

### Güncelleme Sorunları

**Güncelleme takılıyor / başarısız:**
1. Windows Update Troubleshooter çalıştırın
2. SoftwareDistribution klasörünü temizleyin:
   - Yönetici CMD : \`net stop wuauserv\`
   - \`del /S /Q C:\\Windows\\SoftwareDistribution\\Download\\*\`
   - \`net start wuauserv\`
3. Disk alanını kontrol edin (min 20GB gerekli)

**Güncelleme sonrası sorun:**
1. Sorunlu güncellemeyi kaldırın: Ayarlar > Windows Update > Güncelleme Geçmişi > Güncellemeleri Kaldır
2. Sistem geri yükleme noktasını kullanın
3. IT'ye bilet açın — güncelleme KB numarasını belirtin`,
        author: 'Demo İki',
        createdAt: '2025-11-01T08:00:00Z',
        updatedAt: '2026-03-01T09:00:00Z',
        views: 287,
        helpful: 54,
        tags: ['windows', 'güncelleme', 'wsus', 'patch'],
    },
    {
        id: 'kb9',
        title: 'CRM Sistemi Kullanım Kılavuzu',
        category: 'Yazılım',
        content: `## CRM Sistemi Kullanım Kılavuzu

### Giriş ve Temel Navigasyon
1. crm.sirket.com adresinden giriş yapın
2. Sol menüden modüllere erişin: Müşteriler, Fırsatlar, Görevler, Raporlar
3. Üst arama çubuğundan hızlı arama yapın

### Müşteri Kaydı Oluşturma
1. Müşteriler > Yeni Müşteri
2. Zorunlu alanları doldurun: İsim, E-posta, Telefon, Şirket
3. İlişkili kişileri ekleyin
4. Sektör ve büyüklüğü belirleyin
5. Kaydet'e tıklayın

### Fırsat Yönetimi
- Her fırsata tahmini kapanış tarihi ve tutar ekleyin
- Pipeline aşamalarını doğru güncelleyin
- Notları düzenli tutun

### Yaygın Sorunlar
- **Yavaş yükleniyor:** Tarayıcı önbelleğini temizleyin
- **Rapor çıkmıyor:** Tarih aralığını kontrol edin
- **Bildirim gelmiyor:** Profil > Bildirim Ayarları > Tümünü aç`,
        author: 'Admin Yönetici',
        createdAt: '2025-12-10T10:00:00Z',
        updatedAt: '2026-02-28T15:00:00Z',
        views: 356,
        helpful: 61,
        tags: ['crm', 'müşteri', 'satış', 'pipeline'],
    },
    {
        id: 'kb10',
        title: 'Ağ Sürücüsü Eşleme ve Paylaşım Problemleri',
        category: 'Ağ',
        content: `## Ağ Sürücüsü Eşleme Rehberi

### Ağ Sürücüsü Nasıl Eklenir?
1. Dosya Gezgini > Bu Bilgisayar > Ağ Sürücüsü Eşle
2. Sürücü harfi seçin (Ör: Z:)
3. Klasör yolu: \`\\\\fileserver\\departmanadi\`
4. "Oturum açarken yeniden bağlan" seçin
5. Gerekirse kimlik bilgilerini girin

### Erişim Sorunları
- **"Erişim reddedildi":** IT'ye bilet açın, paylaşım izni düzenlenir
- **Sürücü kayboldu:** Bilgisayarı yeniden başlatın, VPN'e bağlanın
- **Dosya kilidi hatası:** Dosyayı kullanan kişiden kapatmasını isteyin

### Dosya Paylaşımı Kuralları
- Gizli/hassas veriler şifrelenmiş paylaşımda tutulmalı
- 100MB üzeri dosyalar SharePoint'e yüklenmelidir
- Geçici dosyalar paylaşım klasöründe bırakılmamalıdır`,
        author: 'Demo Altı',
        createdAt: '2025-05-18T11:00:00Z',
        updatedAt: '2026-01-05T16:00:00Z',
        views: 198,
        helpful: 38,
        tags: ['ağ', 'paylaşım', 'dosya', 'sürücü'],
    },
    {
        id: 'kb11',
        title: 'Uzak Masaüstü (RDP) Bağlantı Rehberi',
        category: 'Erişim',
        content: `## Uzak Masaüstü Bağlantısı

### Bağlantı Kurulum
1. Başlat > "Uzak Masaüstü Bağlantısı" arayın
2. Bilgisayar adını girin (IT'den öğrenin)
3. Kullanıcı adı: DOMAIN\\kullaniciadi
4. "Bağlan" butonuna tıklayın

### Ön Koşullar
- VPN bağlantısı aktif olmalı (ofis dışından erişim için)
- Hedef bilgisayarda RDP etkin olmalı
- Windows Pro/Enterprise sürümü gerekli

### Sorun Giderme
- **"Bilgisayara ulaşılamıyor":** VPN bağlantısını kontrol edin
- **"Kimlik doğrulama hatası":** Şifrenizi doğrulayın, Caps Lock kontrol edin
- **Performans düşük:** Bağlantı kalitesini düşürün (Deneyim > Modem seçin)
- **Çoklu monitör:** "Tüm monitörlerimi uzak oturum için kullan" seçeneğini işaretleyin`,
        author: 'Demo İki',
        createdAt: '2025-08-01T14:00:00Z',
        updatedAt: '2026-02-10T10:00:00Z',
        views: 276,
        helpful: 47,
        tags: ['rdp', 'uzak', 'masaüstü', 'bağlantı'],
    },
    {
        id: 'kb12',
        title: 'Antivirüs ve Güvenlik Yazılımı Sorunları',
        category: 'Güvenlik',
        content: `## Kurumsal Antivirüs Rehberi

### Kurumsal Standart: CrowdStrike Falcon
- Tüm kurumsal cihazlara zorunlu olarak kurulmuştur
- Otomatik güncellenir, kullanıcı müdahalesi gereksizdir
- Kaldırılmamalı veya devre dışı bırakılmamalıdır

### Bilinen Sorunlar

**"Yüksek CPU kullanımı":**
1. Tarama sırasında normal — tarama bitene kadar bekleyin
2. Sürekli yüksekse: IT'ye bilet açın
3. Geçici çözüm: Büyük dosya transfer işlemlerini geciktirin

**"Dosya engellendi" uyarısı:**
- Tehdit tespit edilmişse kesinlikle dosyayı çalıştırmayın
- Yanlış pozitif (false positive) ise bilet açın
- IT güvenlik ekibi dosyayı inceleyip whitelist'e ekleyebilir

**"Güncelleme başarısız":**
1. İnternet/VPN bağlantısını kontrol edin
2. Bilgisayarı yeniden başlatın
3. Sorun devam ederse IT'ye bildirin`,
        author: 'Admin Yönetici',
        createdAt: '2025-07-01T09:00:00Z',
        updatedAt: '2026-03-01T12:00:00Z',
        views: 189,
        helpful: 29,
        tags: ['güvenlik', 'antivirüs', 'crowdstrike', 'tehdit'],
    },
    {
        id: 'kb13',
        title: 'Yeni Çalışan IT Başlangıç Rehberi',
        category: 'Genel',
        content: `## Yeni Çalışan IT Başlangıç Rehberi

### İlk Gün Yapılacaklar
1. IT'den cihazınızı teslim alın (laptop/masaüstü)
2. Windows hesabınızla giriş yapın (şifre IT tarafından verilir)
3. İlk girişte şifrenizi değiştirin
4. E-posta hesabınızı Outlook'ta yapılandırın
5. VPN kurulumunu tamamlayın

### Kurulması Gereken Uygulamalar
- **Microsoft 365:** Office uygulamaları (Word, Excel, PowerPoint)
- **Microsoft Teams:** İletişim ve toplantılar
- **Cisco AnyConnect:** VPN bağlantısı
- **CRM:** Müşteri yönetimi (departmana göre)

### Bilmeniz Gerekenler
- IT Destek: Dahili 1234 veya destek@sirket.com
- Şifre Min. 12 karakter, 90 günde bir değiştirilmeli
- VPN ofis dışından erişim için zorunlu
- Kişisel USB kullanımı yasaktır

### İlk Hafta Kontrol Listesi
- [ ] Windows hesabı aktif
- [ ] E-posta yapılandırıldı
- [ ] VPN kuruldu ve test edildi
- [ ] Teams hesabı aktif
- [ ] Ağ sürücüleri eşlendi
- [ ] Yazıcı kurulumu tamamlandı`,
        author: 'Admin Yönetici',
        createdAt: '2025-01-15T09:00:00Z',
        updatedAt: '2026-02-15T11:00:00Z',
        views: 634,
        helpful: 112,
        tags: ['yeni çalışan', 'başlangıç', 'kurulum', 'onboarding'],
    },
    {
        id: 'kb14',
        title: 'SharePoint ve OneDrive Kullanımı',
        category: 'Yazılım',
        content: `## SharePoint ve OneDrive Rehberi

### OneDrive Senkronizasyonu
1. Windows görev çubuğundaki OneDrive simgesine tıklayın
2. Kurumsal hesabınızla giriş yapın
3. Senkronize edilecek klasörleri seçin
4. Dosyalarınız otomatik yedeklenir

### SharePoint Döküman Yönetimi
- Departman klasörlerine sharepoint.sirket.com'dan erişin
- Dosyaları doğrudan tarayıcıda düzenleyebilirsiniz
- Sürüm geçmişi: "Sürüm Geçmişi" ile eski sürümlere erişin

### Sorun Giderme
- **Senkronizasyon durdu:** OneDrive'ı yeniden başlatın
- **"Çakışma" hatası:** Dosyanın diğer sürümüyle karşılaştırın
- **Depolama dolu (1TB):** Eski dosyaları arşivleyin veya IT'ye bildirin
- **Paylaşım linki çalışmıyor:** "Kuruluşunuzdaki kişiler" seçeneğini deneyin`,
        author: 'Demo Bir',
        createdAt: '2025-06-20T10:00:00Z',
        updatedAt: '2026-01-28T14:00:00Z',
        views: 312,
        helpful: 56,
        tags: ['sharepoint', 'onedrive', 'bulut', 'dosya'],
    },
    {
        id: 'kb15',
        title: 'Toplantı Odası Ekipman Sorunları',
        category: 'Donanım',
        content: `## Toplantı Odası IT Rehberi

### Standart Ekipman
- TV/Projeksiyon + HDMI kablosu
- Konferans mikrofonu (Poly/Logitech)
- Kamera (geniş açı)
- Teams Room Controller

### Hızlı Sorun Giderme

**Ekranda görüntü yok:**
1. HDMI kablosunu kontrol edin
2. TV'nin doğru giriş kaynağında olduğunu doğrulayın
3. Farklı bir HDMI kablosu deneyin

**Ses sorunu:**
1. Mikrofon cihazının açık olduğunu doğrulayın
2. Teams'de doğru cihazı seçin
3. Kablolarını kontrol edin

**Kablosuz paylaşım çalışmıyor:**
1. Aynı Wi-Fi ağında olduğunuzdan emin olun
2. "screencast.sirket.com" adresini tarayıcıda açın
3. Ekran kodunu girin

### Destek
Çözüm bulamazsanız: IT Destek Dahili 1234`,
        author: 'Demo Altı',
        createdAt: '2025-04-01T13:00:00Z',
        updatedAt: '2025-12-20T09:00:00Z',
        views: 167,
        helpful: 24,
        tags: ['toplantı', 'donanım', 'konferans', 'ekipman'],
    },
];
