-- ============================================================
-- FixIT Destek Sistemi (v2)
-- XAMPP PhpMyAdmin Kurulum Dosyası
-- Tüm roller: admin | agent | employee
-- Demo Şifreler: admin123 / agent123 / user123
-- ============================================================

-- Veritabanı oluşturma ve seçme (No database selected hatasını önler)
CREATE DATABASE IF NOT EXISTS `fixitdb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;
USE `fixitdb`;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- TABLO: users
-- ============================================================


CREATE TABLE `users` (
  `id`                  VARCHAR(50)  NOT NULL PRIMARY KEY,
  `name`                VARCHAR(100) NOT NULL,
  `email`               VARCHAR(100) NOT NULL UNIQUE,
  `password_hash`       VARCHAR(255) NOT NULL,
  `role`                ENUM('admin','agent','employee') NOT NULL DEFAULT 'employee',
  `avatar`              VARCHAR(255) DEFAULT '',
  `department`          VARCHAR(100) DEFAULT '',
  `title`               VARCHAR(100) DEFAULT '',
  `bio`                 TEXT         DEFAULT NULL,
  `timezone`            VARCHAR(50)  DEFAULT 'Europe/Istanbul',
  `language`            VARCHAR(10)  DEFAULT 'tr',
  `phone`               VARCHAR(50)  DEFAULT NULL,
  `status`              ENUM('online','offline','busy','active','inactive') DEFAULT 'offline',
  `tickets_closed`      INT DEFAULT 0,
  `avg_response_minutes` INT DEFAULT 0,
  `email_verified`      BOOLEAN DEFAULT FALSE,
  `verification_code`   VARCHAR(10)  DEFAULT NULL,
  `reset_code`          VARCHAR(10)  DEFAULT NULL,
  `reset_expires`       DATETIME     DEFAULT NULL,
  `last_login`          DATETIME     DEFAULT NULL,
  `created_at`          DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;


-- ============================================================
-- TABLO: tickets
-- ============================================================
CREATE TABLE `tickets` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `status` ENUM('open','in_progress','waiting','resolved','closed') DEFAULT 'open',
  `priority` ENUM('low','medium','high','critical') DEFAULT 'low',
  `category` VARCHAR(50),
  `created_by` VARCHAR(50),
  `created_by_name` VARCHAR(100),
  `assigned_to` VARCHAR(50) DEFAULT NULL,
  `assigned_to_name` VARCHAR(100) DEFAULT NULL,
  `sla_deadline` DATETIME DEFAULT NULL,
  `tags` JSON DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `resolved_at` DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- ============================================================
-- TABLO: ticket_messages
-- ============================================================
CREATE TABLE `ticket_messages` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `ticket_id` VARCHAR(50) NOT NULL,
  `sender_id` VARCHAR(50),
  `sender_name` VARCHAR(100),
  `sender_role` VARCHAR(50),
  `content` TEXT,
  `is_internal` BOOLEAN DEFAULT FALSE,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- ============================================================
-- TABLO: ticket_events
-- ============================================================
CREATE TABLE `ticket_events` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `ticket_id` VARCHAR(50) NOT NULL,
  `type` VARCHAR(50),
  `description` TEXT,
  `user_id` VARCHAR(50),
  `user_name` VARCHAR(100),
  `old_value` VARCHAR(255) DEFAULT NULL,
  `new_value` VARCHAR(255) DEFAULT NULL,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- ============================================================
-- TABLO: assets
-- ============================================================
CREATE TABLE `assets` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `type` VARCHAR(50),
  `brand` VARCHAR(100),
  `model` VARCHAR(100),
  `serial_number` VARCHAR(100),
  `status` VARCHAR(50) DEFAULT 'active',
  `assigned_to` VARCHAR(50) DEFAULT NULL,
  `assigned_to_name` VARCHAR(100) DEFAULT NULL,
  `department` VARCHAR(100),
  `location` VARCHAR(100),
  `purchase_date` DATE DEFAULT NULL,
  `warranty_end` DATE DEFAULT NULL,
  `notes` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- ============================================================
-- TABLO: articles
-- ============================================================
CREATE TABLE `articles` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `content` TEXT,
  `author` VARCHAR(100),
  `author_id` VARCHAR(50) DEFAULT NULL,
  `tags` JSON DEFAULT NULL,
  `views` INT DEFAULT 0,
  `helpful` INT DEFAULT 0,
  `not_helpful_count` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- ============================================================
-- ÖRNEK VERİLER (SITEDEKI AKTİF MOCK VERİLERDEN ÜRETİLMİŞTİR)
-- ============================================================

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `department`, `title`, `bio`, `timezone`, `language`, `phone`, `status`, `tickets_closed`, `avg_response_minutes`, `email_verified`, `created_at`, `last_login`) VALUES 
('u1', 'Admin Yönetici', 'admin@fixit.com', '$2b$10$KMq0SbH8m.U7MR7LTn/Td.Ep9JOqiv6df77Snd2/82PBGUrosasR2', 'admin', 'Bilgi Teknolojileri', 'IT Müdürü', 'Sistem mimarisi ve altyapı yönetimi.', 'Europe/Istanbul', 'tr', '+90 5** *** **33', 'active', 342, 12, 1, '2024-01-15 09:00:00', '2026-03-03 01:30:00'),
('u2', 'Demo Bir', 'demo1@fixit.com', '$2b$10$8OiZBhMkaeV65bFEb9kT7.Jns9nTysUr0lIokkC/fXMAWR.kiGHRS', 'agent', 'Bilgi Teknolojileri', 'Kıdemli Destek Uzmanı', 'Network ve güvenlik konularında uzman.', 'Europe/Istanbul', 'tr', '+90 5** *** **44', 'active', 587, 8, 1, '2024-03-10 09:00:00', '2026-03-03 01:00:00'),
('u3', 'Demo İki', 'demo2@fixit.com', '$2b$10$8OiZBhMkaeV65bFEb9kT7.Jns9nTysUr0lIokkC/fXMAWR.kiGHRS', 'agent', 'Bilgi Teknolojileri', 'Sistem Yöneticisi', NULL, 'Europe/Istanbul', 'tr', '+90 5** *** **55', 'active', 431, 15, 1, '2024-05-20 09:00:00', '2026-03-02 18:00:00'),
('u4', 'Demo Üç', 'demo3@fixit.com', '$2b$10$8OiZBhMkaeV65bFEb9kT7.Jns9nTysUr0lIokkC/fXMAWR.kiGHRS', 'employee', 'Pazarlama', 'Pazarlama Uzmanı', NULL, 'Europe/Istanbul', 'tr', '+90 5** *** **66', 'active', 0, 0, 1, '2024-07-01 09:00:00', '2026-03-03 00:30:00'),
('u5', 'Demo Dört', 'demo4@fixit.com', '$2b$10$8OiZBhMkaeV65bFEb9kT7.Jns9nTysUr0lIokkC/fXMAWR.kiGHRS', 'employee', 'İnsan Kaynakları', 'İK Uzmanı', NULL, 'Europe/Istanbul', 'tr', NULL, 'active', 0, 0, 1, '2024-02-01 09:00:00', '2026-03-02 14:00:00'),
('u6', 'Demo Beş', 'demo5@fixit.com', '$2b$10$8OiZBhMkaeV65bFEb9kT7.Jns9nTysUr0lIokkC/fXMAWR.kiGHRS', 'employee', 'Finans', 'Finans Analisti', NULL, 'Europe/Istanbul', 'tr', NULL, 'active', 0, 0, 1, '2024-04-15 09:00:00', '2026-03-01 16:00:00'),
('u7', 'Demo Altı', 'demo6@fixit.com', '$2b$10$8OiZBhMkaeV65bFEb9kT7.Jns9nTysUr0lIokkC/fXMAWR.kiGHRS', 'agent', 'Bilgi Teknolojileri', 'Ağ Uzmanı', NULL, 'Europe/Istanbul', 'tr', NULL, 'active', 298, 11, 1, '2024-06-10 09:00:00', '2026-03-02 12:00:00'),
('u8', 'Demo Yedi', 'demo7@fixit.com', '$2b$10$8OiZBhMkaeV65bFEb9kT7.Jns9nTysUr0lIokkC/fXMAWR.kiGHRS', 'employee', 'Satış', 'Satış Temsilcisi', NULL, 'Europe/Istanbul', 'tr', NULL, 'active', 0, 0, 1, '2025-01-05 09:00:00', '2026-03-03 00:00:00');

INSERT INTO `tickets` (`id`, `title`, `description`, `status`, `priority`, `category`, `created_by`, `created_by_name`, `assigned_to`, `assigned_to_name`, `sla_deadline`, `tags`, `created_at`, `updated_at`, `resolved_at`) VALUES 
('TKT-1001', 'VPN bağlantısı kurulamıyor', 'Evden çalışırken VPN bağlantısı sürekli kopuyor. Cisco AnyConnect "Connection attempt failed" hatası veriyor.', 'in_progress', 'high', 'network', 'u4', 'Demo Üç', 'u2', 'Demo Bir', '2026-03-18 17:15:00', '["vpn","uzaktan-çalışma"]', '2026-03-10 09:15:00', '2026-03-11 14:30:00', NULL),
('TKT-1002', 'Yazıcı çıktı almıyor', '3. kattaki HP LaserJet yazıcı kağıt sıkışması sonrası çalışmayı durdurdu.', 'open', 'medium', 'hardware', 'u5', 'Demo Dört', 'u3', 'Demo İki', '2026-03-19 08:00:00', '["yazıcı","donanım"]', '2026-03-11 08:00:00', '2026-03-11 08:00:00', NULL),
('TKT-1003', 'E-posta gönderilemiyor', 'Outlook üzerinden dış mail gönderemiyorum. "550 relay denied" hatası alıyorum.', 'waiting', 'high', 'email', 'u6', 'Demo Beş', 'u2', 'Demo Bir', '2026-03-17 19:45:00', '["e-posta","outlook"]', '2026-03-09 11:45:00', '2026-03-10 16:00:00', NULL),
('TKT-1004', 'Yeni çalışan hesap oluşturma', 'Pazarlama departmanına yeni başlayan 3 kişi için AD hesabı, e-posta ve VPN erişimi gerekiyor.', 'open', 'medium', 'access', 'u4', 'Demo Üç', 'u7', 'Demo Altı', '2026-03-20 10:00:00', '["erişim","yeni-çalışan"]', '2026-03-12 10:00:00', '2026-03-12 10:00:00', NULL),
('TKT-1005', 'Sunucu yavaşlama sorunu', 'Ana uygulama sunucusunda CPU kullanımı sürekli %95 üzerinde. Performans kritik seviyede düşüş gösteriyor.', 'in_progress', 'critical', 'software', 'u1', 'Admin Yönetici', 'u2', 'Demo Bir', '2026-03-17 11:30:00', '["sunucu","performans","kritik"]', '2026-03-08 07:30:00', '2026-03-09 02:00:00', NULL),
('TKT-1006', 'Güvenlik taraması uyarısı', 'CrowdStrike Falcon bir makinede şüpheli dosya tespit etti. Acil inceleme gerekiyor.', 'open', 'critical', 'security', 'u1', 'Admin Yönetici', 'u3', 'Demo İki', '2026-03-17 18:00:00', '["güvenlik","acil"]', '2026-03-13 14:00:00', '2026-03-13 14:00:00', NULL),
('TKT-1007', 'Windows lisans aktivasyon hatası', '5 bilgisayarda Windows lisansı "not activated" uyarısı veriyor.', 'resolved', 'low', 'software', 'u8', 'Demo Yedi', 'u7', 'Demo Altı', '2026-03-09 09:00:00', '["lisans","windows"]', '2026-03-05 09:00:00', '2026-03-07 16:00:00', '2026-03-07 16:00:00'),
('TKT-1008', 'Toplantı odası projeksiyon arızası', 'A-301 toplantı odasında projeksiyon çalışmıyor, HDMI sinyali algılanmıyor.', 'resolved', 'medium', 'hardware', 'u5', 'Demo Dört', 'u3', 'Demo İki', '2026-03-10 13:00:00', '["projeksiyon","toplantı-odası"]', '2026-03-06 13:00:00', '2026-03-08 10:00:00', '2026-03-08 10:00:00');

INSERT INTO `ticket_messages` (`id`, `ticket_id`, `sender_id`, `sender_name`, `sender_role`, `content`, `is_internal`, `timestamp`) VALUES 
('msg-001', 'TKT-1001', 'u4', 'Demo Üç', 'employee', 'VPN bağlantısı sabahtan beri çalışmıyor. Acil toplantılarım var.', 0, '2026-03-10 09:20:00'),
('msg-002', 'TKT-1001', 'u2', 'Demo Bir', 'agent', 'AnyConnect sürümünüzü kontrol edebilir misiniz? Ayarlar > Hakkında kısmından.', 0, '2026-03-10 10:05:00'),
('msg-003', 'TKT-1005', 'u1', 'Admin Yönetici', 'admin', 'Sunucu loglarında bellek sızıntısı tespit edildi. Uygulamanın yeniden başlatılması gerekiyor.', 0, '2026-03-08 15:00:00'),
('msg-004', 'TKT-1005', 'u2', 'Demo Bir', 'agent', 'Bakım penceresi planladım. Bu gece 02:00-04:00 arası uygulama yeniden başlatılacak.', 0, '2026-03-08 17:30:00');

INSERT INTO `ticket_events` (`id`, `ticket_id`, `type`, `description`, `user_id`, `user_name`, `old_value`, `new_value`, `timestamp`) VALUES 
('evt-001', 'TKT-1001', 'created', 'Bilet oluşturuldu', 'u4', 'Demo Üç', NULL, NULL, '2026-03-10 09:15:00'),
('evt-002', 'TKT-1001', 'assigned', 'Demo Bir''e atandı', 'u1', 'Admin Yönetici', NULL, NULL, '2026-03-10 09:30:00'),
('evt-003', 'TKT-1001', 'status_changed', 'Durum değişti', 'u2', 'Demo Bir', 'open', 'in_progress', '2026-03-11 14:30:00'),
('evt-010', 'TKT-1002', 'created', 'Bilet oluşturuldu', 'u5', 'Demo Dört', NULL, NULL, '2026-03-11 08:00:00'),
('evt-020', 'TKT-1003', 'created', 'Bilet oluşturuldu', 'u6', 'Demo Beş', NULL, NULL, '2026-03-09 11:45:00'),
('evt-021', 'TKT-1003', 'status_changed', 'Beklemede – dış sunucu yanıtı bekleniyor', 'u2', 'Demo Bir', 'open', 'waiting', '2026-03-10 16:00:00'),
('evt-030', 'TKT-1004', 'created', 'Bilet oluşturuldu', 'u4', 'Demo Üç', NULL, NULL, '2026-03-12 10:00:00'),
('evt-040', 'TKT-1005', 'created', 'Bilet oluşturuldu', 'u1', 'Admin Yönetici', NULL, NULL, '2026-03-08 07:30:00'),
('evt-041', 'TKT-1005', 'assigned', 'Demo Bir''e atandı', 'u1', 'Admin Yönetici', NULL, NULL, '2026-03-08 07:35:00'),
('evt-042', 'TKT-1005', 'status_changed', 'İnceleme başlandı', 'u2', 'Demo Bir', 'open', 'in_progress', '2026-03-09 02:00:00'),
('evt-050', 'TKT-1006', 'created', 'Bilet oluşturuldu', 'u1', 'Admin Yönetici', NULL, NULL, '2026-03-13 14:00:00'),
('evt-060', 'TKT-1007', 'created', 'Bilet oluşturuldu', 'u8', 'Demo Yedi', NULL, NULL, '2026-03-05 09:00:00'),
('evt-061', 'TKT-1007', 'resolved', 'Bilet çözüldü', 'u7', 'Demo Altı', 'open', 'resolved', '2026-03-07 16:00:00'),
('evt-070', 'TKT-1008', 'created', 'Bilet oluşturuldu', 'u5', 'Demo Dört', NULL, NULL, '2026-03-06 13:00:00'),
('evt-071', 'TKT-1008', 'resolved', 'Bilet çözüldü – HDMI kablosu değiştirildi', 'u3', 'Demo İki', 'in_progress', 'resolved', '2026-03-08 10:00:00');

INSERT INTO `assets` (`id`, `name`, `type`, `brand`, `model`, `serial_number`, `status`, `assigned_to`, `assigned_to_name`, `department`, `location`, `purchase_date`, `warranty_end`, `notes`, `created_at`, `updated_at`) VALUES 
('a1', 'Dell Latitude 5540', 'laptop', 'Dell', 'Latitude 5540', 'DL5540-2024-001', 'active', 'u5', 'Ahmet Türkmen', 'Pazarlama', '2. Kat - Ofis A', '2024-03-15', NULL, 'i7-1365U, 16GB RAM, 512GB SSD', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a2', 'Dell Latitude 5540', 'laptop', 'Dell', 'Latitude 5540', 'DL5540-2024-002', 'maintenance', 'u7', 'Murat Öztürk', 'Finans', 'Servis', '2024-03-15', NULL, 'Ekran titreme sorunu - serviste', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a3', 'HP EliteDesk 800 G9', 'desktop', 'HP', 'EliteDesk 800 G9', 'HPE800-2024-001', 'active', 'u6', 'Zeynep Çelik', 'İnsan Kaynakları', '1. Kat - İK Ofisi', '2024-01-10', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a4', 'HP LaserJet Pro M404', 'printer', 'HP', 'LaserJet Pro M404dn', 'HPLJ-2023-001', 'maintenance', NULL, NULL, 'Genel', '3. Kat - Ortak Alan', '2023-06-01', NULL, 'Kağıt sıkışması sorunu', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a5', 'Dell UltraSharp U2723QE', 'monitor', 'Dell', 'U2723QE', 'DLU27-2024-001', 'active', 'u2', 'Elif Demir', 'Bilgi Teknolojileri', 'IT Odası', '2024-02-20', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a6', 'Cisco Catalyst 9200', 'network', 'Cisco', 'Catalyst 9200L', 'CSC9200-2023-001', 'active', NULL, NULL, 'Bilgi Teknolojileri', 'Sunucu Odası', '2023-09-01', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a7', 'Dell PowerEdge R750', 'server', 'Dell', 'PowerEdge R750xs', 'DPE750-2024-001', 'active', NULL, NULL, 'Bilgi Teknolojileri', 'Sunucu Odası', '2024-01-01', NULL, 'Ana uygulama sunucusu', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a8', 'iPhone 15 Pro', 'phone', 'Apple', 'iPhone 15 Pro', 'APL15P-2024-001', 'active', 'u1', 'Kemal Yıldırım', 'Bilgi Teknolojileri', '-', '2024-10-01', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a9', 'MacBook Pro 16"', 'laptop', 'Apple', 'MacBook Pro 16" M3 Pro', 'APLMBP-2025-001', 'active', 'u1', 'Kemal Yıldırım', 'Bilgi Teknolojileri', 'IT Odası', '2025-01-15', NULL, 'M3 Pro, 36GB RAM, 1TB SSD', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a10', 'Samsung Galaxy Tab S9', 'tablet', 'Samsung', 'Galaxy Tab S9 FE', 'SMGT-2025-001', 'retired', NULL, NULL, 'Satış', 'Depo', '2023-03-01', NULL, 'Batarya ömrü tükenmiş', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO `articles` (`id`, `title`, `category`, `content`, `author`, `author_id`, `tags`, `views`, `helpful`, `not_helpful_count`, `created_at`, `updated_at`) VALUES 
('kb1', 'VPN Bağlantı Sorunlarını Giderme', 'Ağ', '## VPN Bağlantı Sorunlarını Giderme

### Sık Karşılaşılan Sorunlar

**1. Bağlantı kurulamıyor**
- Cisco AnyConnect istemcisinin güncel olduğundan emin olun
- İnternet bağlantınızı kontrol edin
- Güvenlik duvarı veya antivirüs yazılımının VPN''i engellemediğinden emin olun

**2. Bağlantı sık sık kopuyor**
- Ağ adaptörü sürücülerini güncelleyin
- Power Management ayarlarından "Allow the computer to turn off this device" seçeneğini kapatın
- MTU değerini 1400''e düşürmeyi deneyin

**3. Yavaş bağlantı**
- Split tunneling ayarlarını kontrol edin
- Farklı bir VPN sunucusu deneyin
- ISP''nizle bant genişliği sorunlarını görüşün

### Adım Adım Çözüm
1. Cisco AnyConnect''i kapatın
2. Komut satırında `ipconfig /flushdns` çalıştırın
3. AnyConnect''i yeniden başlatın
4. Sunucu adresini manuel girin: vpn.sirket.com', 'Demo Altı', NULL, '["vpn","ağ","cisco","bağlantı"]', 234, 45, 0, '2025-08-15 10:00:00', '2026-01-20 14:00:00'),
('kb2', 'Active Directory Şifre Sıfırlama Prosedürü', 'Erişim', '## Şifre Sıfırlama Prosedürü

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
3. Geçici şifre verilir, ilk girişte değiştirilmelidir', 'Demo İki', NULL, '["şifre","active-directory","hesap"]', 567, 89, 0, '2025-06-01 09:00:00', '2025-12-15 16:00:00'),
('kb3', 'Yazıcı Kurulumu ve Sorun Giderme', 'Donanım', '## Yazıcı Kurulumu

### Ağ Yazıcısı Ekleme
1. Ayarlar > Yazıcılar > Yazıcı Ekle
2. "Ağ yazıcısı ekle" seçin
3. Yazıcı IP adresini girin (IT''den alın)
4. Sürücü otomatik yüklenecektir

### Yaygın Sorunlar
- **Yazıcı bulunamıyor:** Ağ bağlantısını kontrol edin
- **Kağıt sıkışması:** Tepsiyi çıkarın, sıkışan kağıdı yavaşça çekin
- **Kalite düşük:** Toner seviyesini kontrol edin
- **Çevrimdışı görünüyor:** Yazıcıyı yeniden başlatın', 'Demo İki', NULL, '["yazıcı","donanım","kurulum"]', 189, 32, 0, '2025-04-10 11:00:00', '2025-11-05 09:00:00'),
('kb4', 'E-posta İmza Standartları', 'E-posta', '## Kurumsal E-posta İmza Standartları

### Standart Format
```
Ad Soyad | Unvan
Departman
Şirket Adı A.Ş.
T: +90 2** *** ** ** | D: XXXX
E: ad.soyad@mail.com
W: www.sirket.com
```

### Kurallar
- Logo kullanmayın (e-posta boyutunu artırır)
- Sosyal medya linkleri eklemeyin
- Kişisel sloganlar yasaktır
- Font: Calibri 10pt, renk: #333333', 'Demo Bir', NULL, '["e-posta","imza","standart"]', 312, 21, 0, '2025-03-01 08:00:00', '2025-09-10 12:00:00'),
('kb5', 'Bilgisayar Yavaşlama Sorunlarına İlk Müdahale', 'Yazılım', '## Bilgisayar Yavaşlama Çözüm Rehberi

### 1. Temel Kontroller
- CPU ve RAM kullanımını Task Manager''dan kontrol edin
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
- Açıklama: Denediğiniz adımları belirtin', 'Demo Bir', NULL, '["performans","yavaşlama","windows"]', 445, 67, 0, '2025-07-20 14:00:00', '2026-02-01 10:00:00'),
('kb6', 'Outlook Yapılandırma ve Sorun Giderme', 'E-posta', '## Outlook Yapılandırma Rehberi

### E-posta Hesabı Ekleme (Exchange)
1. Outlook > Dosya > Hesap Ekle
2. E-posta adresinizi girin (ad.soyad@sirket.com)
3. "Gelişmiş seçenekler" > "Hesabımı el ile ayarla"
4. Exchange seçeneğini işaretleyin
5. Sunucu: mail.sirket.com / Bağlantı noktası: 443

### Sık Karşılaşılan Sorunlar

**Outlook açılmıyor / donuyor:**
1. Outlook''u güvenli modda açın: Win+R > `outlook.exe /safe`
2. Eklentileri devre dışı bırakın
3. Profili onarın: Denetim Masası > Mail > Profiller

**Takvim senkronizasyonu bozuk:**
1. Çevrimdışı çalışma modunu kapatın
2. Exchange hesabını kaldırıp tekrar ekleyin
3. OST dosyasını silerek yeniden oluşturun

**Çok büyük posta kutusu uyarısı:**
- 50GB kotanız var
- Eski e-postaları arşivleyin (Dosya > Arşiv)
- Silinmiş öğeleri kalıcı olarak temizleyin', 'Demo Bir', NULL, '["outlook","e-posta","exchange","yapılandırma"]', 398, 78, 0, '2025-09-12 10:00:00', '2026-02-20 11:00:00'),
('kb7', 'Microsoft Teams Kullanım Rehberi', 'Yazılım', '## Microsoft Teams Kullanım Rehberi

### İlk Kurulum
1. teams.microsoft.com''dan veya IT paketi ile kurun
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
- Windows Ses ayarlarından Teams''e mikrofon izni verin

**Ekran paylaşımı çalışmıyor:**
- Teams''i admin olarak çalıştırın
- Ayarlar > Uygulama İzinleri > Ekran paylaşımı: Tüm Ekran

**Bildirimler gelmiyor:**
- Ayarlar > Bildirimler > Tümünü etkinleştir
- Windows''ta Odak Yardımı''nı kapatın', 'Demo Altı', NULL, '["teams","toplantı","iletişim","video"]', 521, 93, 0, '2025-10-05 09:00:00', '2026-01-15 14:00:00'),
('kb8', 'Windows 11 Güncelleme Yönetimi', 'Yazılım', '## Windows 11 Güncelleme Rehberi

### Kurumsal Güncelleme Politikası
- Güncellemeler WSUS sunucusu üzerinden yönetilir
- Kritik güvenlik yamaları 48 saat içinde uygulanır
- Özellik güncellemeleri IT onayından sonra gelir

### Güncelleme Sorunları

**Güncelleme takılıyor / başarısız:**
1. Windows Update Troubleshooter çalıştırın
2. SoftwareDistribution klasörünü temizleyin:
   - Yönetici CMD : `net stop wuauserv`
   - `del /S /Q C:\Windows\SoftwareDistribution\Download\*`
   - `net start wuauserv`
3. Disk alanını kontrol edin (min 20GB gerekli)

**Güncelleme sonrası sorun:**
1. Sorunlu güncellemeyi kaldırın: Ayarlar > Windows Update > Güncelleme Geçmişi > Güncellemeleri Kaldır
2. Sistem geri yükleme noktasını kullanın
3. IT''ye bilet açın — güncelleme KB numarasını belirtin', 'Demo İki', NULL, '["windows","güncelleme","wsus","patch"]', 287, 54, 0, '2025-11-01 08:00:00', '2026-03-01 09:00:00'),
('kb9', 'CRM Sistemi Kullanım Kılavuzu', 'Yazılım', '## CRM Sistemi Kullanım Kılavuzu

### Giriş ve Temel Navigasyon
1. crm.sirket.com adresinden giriş yapın
2. Sol menüden modüllere erişin: Müşteriler, Fırsatlar, Görevler, Raporlar
3. Üst arama çubuğundan hızlı arama yapın

### Müşteri Kaydı Oluşturma
1. Müşteriler > Yeni Müşteri
2. Zorunlu alanları doldurun: İsim, E-posta, Telefon, Şirket
3. İlişkili kişileri ekleyin
4. Sektör ve büyüklüğü belirleyin
5. Kaydet''e tıklayın

### Fırsat Yönetimi
- Her fırsata tahmini kapanış tarihi ve tutar ekleyin
- Pipeline aşamalarını doğru güncelleyin
- Notları düzenli tutun

### Yaygın Sorunlar
- **Yavaş yükleniyor:** Tarayıcı önbelleğini temizleyin
- **Rapor çıkmıyor:** Tarih aralığını kontrol edin
- **Bildirim gelmiyor:** Profil > Bildirim Ayarları > Tümünü aç', 'Admin Yönetici', NULL, '["crm","müşteri","satış","pipeline"]', 356, 61, 0, '2025-12-10 10:00:00', '2026-02-28 15:00:00'),
('kb10', 'Ağ Sürücüsü Eşleme ve Paylaşım Problemleri', 'Ağ', '## Ağ Sürücüsü Eşleme Rehberi

### Ağ Sürücüsü Nasıl Eklenir?
1. Dosya Gezgini > Bu Bilgisayar > Ağ Sürücüsü Eşle
2. Sürücü harfi seçin (Ör: Z:)
3. Klasör yolu: `\\fileserver\departmanadi`
4. "Oturum açarken yeniden bağlan" seçin
5. Gerekirse kimlik bilgilerini girin

### Erişim Sorunları
- **"Erişim reddedildi":** IT''ye bilet açın, paylaşım izni düzenlenir
- **Sürücü kayboldu:** Bilgisayarı yeniden başlatın, VPN''e bağlanın
- **Dosya kilidi hatası:** Dosyayı kullanan kişiden kapatmasını isteyin

### Dosya Paylaşımı Kuralları
- Gizli/hassas veriler şifrelenmiş paylaşımda tutulmalı
- 100MB üzeri dosyalar SharePoint''e yüklenmelidir
- Geçici dosyalar paylaşım klasöründe bırakılmamalıdır', 'Demo Altı', NULL, '["ağ","paylaşım","dosya","sürücü"]', 198, 38, 0, '2025-05-18 11:00:00', '2026-01-05 16:00:00'),
('kb11', 'Uzak Masaüstü (RDP) Bağlantı Rehberi', 'Erişim', '## Uzak Masaüstü Bağlantısı

### Bağlantı Kurulum
1. Başlat > "Uzak Masaüstü Bağlantısı" arayın
2. Bilgisayar adını girin (IT''den öğrenin)
3. Kullanıcı adı: DOMAIN\kullaniciadi
4. "Bağlan" butonuna tıklayın

### Ön Koşullar
- VPN bağlantısı aktif olmalı (ofis dışından erişim için)
- Hedef bilgisayarda RDP etkin olmalı
- Windows Pro/Enterprise sürümü gerekli

### Sorun Giderme
- **"Bilgisayara ulaşılamıyor":** VPN bağlantısını kontrol edin
- **"Kimlik doğrulama hatası":** Şifrenizi doğrulayın, Caps Lock kontrol edin
- **Performans düşük:** Bağlantı kalitesini düşürün (Deneyim > Modem seçin)
- **Çoklu monitör:** "Tüm monitörlerimi uzak oturum için kullan" seçeneğini işaretleyin', 'Demo İki', NULL, '["rdp","uzak","masaüstü","bağlantı"]', 276, 47, 0, '2025-08-01 14:00:00', '2026-02-10 10:00:00'),
('kb12', 'Antivirüs ve Güvenlik Yazılımı Sorunları', 'Güvenlik', '## Kurumsal Antivirüs Rehberi

### Kurumsal Standart: CrowdStrike Falcon
- Tüm kurumsal cihazlara zorunlu olarak kurulmuştur
- Otomatik güncellenir, kullanıcı müdahalesi gereksizdir
- Kaldırılmamalı veya devre dışı bırakılmamalıdır

### Bilinen Sorunlar

**"Yüksek CPU kullanımı":**
1. Tarama sırasında normal — tarama bitene kadar bekleyin
2. Sürekli yüksekse: IT''ye bilet açın
3. Geçici çözüm: Büyük dosya transfer işlemlerini geciktirin

**"Dosya engellendi" uyarısı:**
- Tehdit tespit edilmişse kesinlikle dosyayı çalıştırmayın
- Yanlış pozitif (false positive) ise bilet açın
- IT güvenlik ekibi dosyayı inceleyip whitelist''e ekleyebilir

**"Güncelleme başarısız":**
1. İnternet/VPN bağlantısını kontrol edin
2. Bilgisayarı yeniden başlatın
3. Sorun devam ederse IT''ye bildirin', 'Admin Yönetici', NULL, '["güvenlik","antivirüs","crowdstrike","tehdit"]', 189, 29, 0, '2025-07-01 09:00:00', '2026-03-01 12:00:00'),
('kb13', 'Yeni Çalışan IT Başlangıç Rehberi', 'Genel', '## Yeni Çalışan IT Başlangıç Rehberi

### İlk Gün Yapılacaklar
1. IT''den cihazınızı teslim alın (laptop/masaüstü)
2. Windows hesabınızla giriş yapın (şifre IT tarafından verilir)
3. İlk girişte şifrenizi değiştirin
4. E-posta hesabınızı Outlook''ta yapılandırın
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
- [ ] Yazıcı kurulumu tamamlandı', 'Admin Yönetici', NULL, '["yeni çalışan","başlangıç","kurulum","onboarding"]', 634, 112, 0, '2025-01-15 09:00:00', '2026-02-15 11:00:00'),
('kb14', 'SharePoint ve OneDrive Kullanımı', 'Yazılım', '## SharePoint ve OneDrive Rehberi

### OneDrive Senkronizasyonu
1. Windows görev çubuğundaki OneDrive simgesine tıklayın
2. Kurumsal hesabınızla giriş yapın
3. Senkronize edilecek klasörleri seçin
4. Dosyalarınız otomatik yedeklenir

### SharePoint Döküman Yönetimi
- Departman klasörlerine sharepoint.sirket.com''dan erişin
- Dosyaları doğrudan tarayıcıda düzenleyebilirsiniz
- Sürüm geçmişi: "Sürüm Geçmişi" ile eski sürümlere erişin

### Sorun Giderme
- **Senkronizasyon durdu:** OneDrive''ı yeniden başlatın
- **"Çakışma" hatası:** Dosyanın diğer sürümüyle karşılaştırın
- **Depolama dolu (1TB):** Eski dosyaları arşivleyin veya IT''ye bildirin
- **Paylaşım linki çalışmıyor:** "Kuruluşunuzdaki kişiler" seçeneğini deneyin', 'Demo Bir', NULL, '["sharepoint","onedrive","bulut","dosya"]', 312, 56, 0, '2025-06-20 10:00:00', '2026-01-28 14:00:00'),
('kb15', 'Toplantı Odası Ekipman Sorunları', 'Donanım', '## Toplantı Odası IT Rehberi

### Standart Ekipman
- TV/Projeksiyon + HDMI kablosu
- Konferans mikrofonu (Poly/Logitech)
- Kamera (geniş açı)
- Teams Room Controller

### Hızlı Sorun Giderme

**Ekranda görüntü yok:**
1. HDMI kablosunu kontrol edin
2. TV''nin doğru giriş kaynağında olduğunu doğrulayın
3. Farklı bir HDMI kablosu deneyin

**Ses sorunu:**
1. Mikrofon cihazının açık olduğunu doğrulayın
2. Teams''de doğru cihazı seçin
3. Kablolarını kontrol edin

**Kablosuz paylaşım çalışmıyor:**
1. Aynı Wi-Fi ağında olduğunuzdan emin olun
2. "screencast.sirket.com" adresini tarayıcıda açın
3. Ekran kodunu girin

### Destek
Çözüm bulamazsanız: IT Destek Dahili 1234', 'Demo Altı', NULL, '["toplantı","donanım","konferans","ekipman"]', 167, 24, 0, '2025-04-01 13:00:00', '2025-12-20 09:00:00');

SET FOREIGN_KEY_CHECKS = 1;
