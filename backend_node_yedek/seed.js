import pool from './db.js';

async function seed() {
    console.log('Seeding database...');

    // Users
    const users = [
        ['u1', 'K. Yildirim', 'k.yildirim@mail.com', 'admin', 'Bilgi Teknolojileri', 'active', '+90 5** *** **33', 'IT Muduru', 342, 12, '2024-01-15 09:00:00', '2026-03-03 01:30:00'],
        ['u2', 'E. Demir', 'e.demir@mail.com', 'agent', 'Bilgi Teknolojileri', 'active', '+90 5** *** **44', 'Kidemli Destek Uzmani', 587, 8, '2024-03-10 09:00:00', '2026-03-03 01:00:00'],
        ['u3', 'B. Kaya', 'b.kaya@mail.com', 'agent', 'Bilgi Teknolojileri', 'active', '+90 5** *** **55', 'Sistem Yoneticisi', 431, 15, '2024-05-20 09:00:00', '2026-03-02 18:00:00'],
        ['u4', 'S. Arslan', 's.arslan@mail.com', 'agent', 'Bilgi Teknolojileri', 'active', '+90 5** *** **66', 'Ag Uzmani', 298, 11, '2024-07-01 09:00:00', '2026-03-03 00:30:00'],
        ['u5', 'A. Turkmen', 'a.turkmen@mail.com', 'employee', 'Pazarlama', 'active', null, 'Pazarlama Muduru', 0, 0, '2024-02-01 09:00:00', '2026-03-02 14:00:00'],
        ['u6', 'Z. Celik', 'z.celik@mail.com', 'employee', 'Insan Kaynaklari', 'active', null, 'IK Uzmani', 0, 0, '2024-04-15 09:00:00', '2026-03-01 16:00:00'],
        ['u7', 'M. Ozturk', 'm.ozturk@mail.com', 'employee', 'Finans', 'active', null, 'Finans Analisti', 0, 0, '2024-06-10 09:00:00', '2026-03-02 12:00:00'],
        ['u8', 'A. Yilmaz', 'a.yilmaz@mail.com', 'employee', 'Satis', 'active', null, 'Satis Temsilcisi', 0, 0, '2025-01-05 09:00:00', '2026-03-03 00:00:00'],
    ];
    for (const u of users) {
        await pool.query(
            `INSERT IGNORE INTO users (id,name,email,role,department,status,phone,title,tickets_closed,avg_response_minutes,created_at,last_login) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, u
        );
    }
    console.log('  Users seeded');

    // Tickets
    const now = new Date();
    const h = (hoursAgo) => new Date(now.getTime() - hoursAgo * 3600000);
    const fh = (hoursAhead) => new Date(now.getTime() + hoursAhead * 3600000);

    const tickets = [
        ['TKT-001', 'ERP sistemi cok yavas calisiyor', 'Son 2 gundur ERP sistemi asiri yavas. Fatura kesmek 3-4 dakika suruyor.', 'software', 'critical', 'in_progress', 'u7', 'M. Ozturk', 'u2', 'E. Demir', fh(1), '["ERP","performans"]', h(6), h(2), null],
        ['TKT-002', 'VPN baglantisi surekli kopuyor', 'Uzaktan calisirken VPN her 15-20 dakikada bir kopuyor.', 'network', 'high', 'open', 'u5', 'A. Turkmen', 'u4', 'S. Arslan', fh(4), '["VPN","uzaktan-calisma"]', h(12), h(10), null],
        ['TKT-003', 'Yeni calisan icin hesap olusturulmasi', 'Pazarlama departmanina yeni baslayan icin AD hesabi ve ERP erisimi gerekiyor.', 'access', 'medium', 'in_progress', 'u6', 'Z. Celik', 'u3', 'B. Kaya', fh(12), '["hesap-olusturma","onboarding"]', h(48), h(24), null],
        ['TKT-004', 'Yazici kagit sikismasi - 3. Kat', '3. kattaki HP LaserJet yazicida surekli kagit sikisiyor.', 'hardware', 'low', 'waiting', 'u8', 'A. Yilmaz', 'u3', 'B. Kaya', fh(24), '["yazici","donanim"]', h(72), h(48), null],
        ['TKT-005', 'Outlook e-posta gonderme hatasi', 'Son 1 saattir Outlook uzerinden e-posta gonderemiyorum. 550 5.7.1 hatasi.', 'email', 'high', 'open', 'u5', 'A. Turkmen', null, null, fh(7), '["outlook","e-posta"]', h(1), h(1), null],
        ['TKT-006', 'Guvenlik duvari kurali guncellenmesi', 'Yeni bulut servisinin IP araliginin beyaz listeye alinmasi.', 'security', 'medium', 'resolved', 'u1', 'K. Yildirim', 'u4', 'S. Arslan', h(48), '["firewall","guvenlik"]', h(96), h(72), h(72)],
        ['TKT-007', 'Laptop ekrani titriyor', 'Dell Latitude 5540 ekrani duzensiz araliklara titriyor.', 'hardware', 'medium', 'in_progress', 'u7', 'M. Ozturk', 'u3', 'B. Kaya', fh(6), '["laptop","ekran"]', h(36), h(12), null],
        ['TKT-008', 'Sifre sifirlama talebi', 'AD sifremi unuttum, sifirlama gerekiyor.', 'access', 'low', 'closed', 'u8', 'A. Yilmaz', 'u2', 'E. Demir', h(100), '["sifre","AD"]', h(120), h(119), h(119)],
    ];
    for (const t of tickets) {
        await pool.query(
            `INSERT IGNORE INTO tickets (id,title,description,category,priority,status,created_by,created_by_name,assigned_to,assigned_to_name,sla_deadline,tags,created_at,updated_at,resolved_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, t
        );
    }
    console.log('  Tickets seeded');

    // Messages
    const msgs = [
        ['m1', 'TKT-001', 'u7', 'M. Ozturk', 'employee', 'Fatura ekraninda 30 saniye bekliyoruz. Acil cozum lazim.', false, h(6)],
        ['m2', 'TKT-001', 'u2', 'E. Demir', 'agent', 'DB sunucusundaki sorgu loglarini inceliyorum.', false, h(4)],
        ['m3', 'TKT-001', 'u2', 'E. Demir', 'agent', 'Veritabani indeksleri bozulmus. Yeniden olusturma baslatiyorum.', true, h(2)],
        ['m4', 'TKT-002', 'u5', 'A. Turkmen', 'employee', 'Cisco AnyConnect kullaniyorum. Her 15 dakikada baglanti dusyor.', false, h(12)],
        ['m5', 'TKT-003', 'u6', 'Z. Celik', 'employee', 'AD hesabi, Outlook, Teams ve ERP erisimi gerekiyor.', false, h(48)],
        ['m6', 'TKT-003', 'u3', 'B. Kaya', 'agent', 'AD ve mail hesabi olusturuldu. ERP yetkilendirmesi devam ediyor.', false, h(24)],
        ['m7', 'TKT-004', 'u8', 'A. Yilmaz', 'employee', 'Yazici her 3-4 sayfada bir kagit sikistiriyor.', false, h(72)],
        ['m8', 'TKT-004', 'u3', 'B. Kaya', 'agent', 'Tepsi mekanizmasi incelendi, yedek parca siparisi verildi.', false, h(48)],
        ['m9', 'TKT-005', 'u5', 'A. Turkmen', 'employee', 'E-posta gonderirken 550 5.7.1 hatasi. Alma sorunsuz.', false, h(1)],
        ['m10', 'TKT-007', 'u7', 'M. Ozturk', 'employee', 'Ekran her 5-10 saniyede bir titriyor. Dis monitorde sorun yok.', false, h(36)],
        ['m11', 'TKT-007', 'u3', 'B. Kaya', 'agent', 'Surucu guncellemesi denendi fayda etmedi. Garanti kapsaminda servise gonderilecek.', false, h(12)],
    ];
    for (const m of msgs) {
        await pool.query(
            `INSERT IGNORE INTO ticket_messages (id,ticket_id,sender_id,sender_name,sender_role,content,is_internal,timestamp) VALUES (?,?,?,?,?,?,?,?)`, m
        );
    }
    console.log('  Messages seeded');

    // Events
    const evts = [
        ['e1', 'TKT-001', 'created', 'Bilet olusturuldu', 'u7', 'M. Ozturk', null, null, h(6)],
        ['e2', 'TKT-001', 'assigned', 'E. Demir\'e atandi', 'u1', 'K. Yildirim', null, null, h(5)],
        ['e3', 'TKT-001', 'status_changed', 'Durum degisti', 'u2', 'E. Demir', 'open', 'in_progress', h(4)],
        ['e4', 'TKT-002', 'created', 'Bilet olusturuldu', 'u5', 'A. Turkmen', null, null, h(12)],
        ['e5', 'TKT-002', 'assigned', 'S. Arslan\'a atandi', 'u1', 'K. Yildirim', null, null, h(10)],
        ['e6', 'TKT-003', 'created', 'Bilet olusturuldu', 'u6', 'Z. Celik', null, null, h(48)],
        ['e7', 'TKT-003', 'assigned', 'B. Kaya\'ya atandi', 'u1', 'K. Yildirim', null, null, h(46)],
        ['e8', 'TKT-003', 'status_changed', 'Durum degisti', 'u3', 'B. Kaya', 'open', 'in_progress', h(24)],
        ['e9', 'TKT-004', 'created', 'Bilet olusturuldu', 'u8', 'A. Yilmaz', null, null, h(72)],
        ['e10', 'TKT-004', 'status_changed', 'Durum Beklemede olarak degisti', 'u3', 'B. Kaya', 'in_progress', 'waiting', h(48)],
        ['e11', 'TKT-005', 'created', 'Bilet olusturuldu', 'u5', 'A. Turkmen', null, null, h(1)],
        ['e12', 'TKT-006', 'created', 'Bilet olusturuldu', 'u1', 'K. Yildirim', null, null, h(96)],
        ['e13', 'TKT-006', 'resolved', 'Bilet cozuldu', 'u4', 'S. Arslan', null, null, h(72)],
        ['e14', 'TKT-007', 'created', 'Bilet olusturuldu', 'u7', 'M. Ozturk', null, null, h(36)],
        ['e15', 'TKT-007', 'status_changed', 'Durum degisti', 'u3', 'B. Kaya', 'open', 'in_progress', h(12)],
        ['e16', 'TKT-008', 'created', 'Bilet olusturuldu', 'u8', 'A. Yilmaz', null, null, h(120)],
        ['e17', 'TKT-008', 'resolved', 'Sifre sifirlandi', 'u2', 'E. Demir', null, null, h(119)],
        ['e18', 'TKT-008', 'status_changed', 'Bilet kapatildi', 'u2', 'E. Demir', 'resolved', 'closed', h(119)],
    ];
    for (const e of evts) {
        await pool.query(
            `INSERT IGNORE INTO ticket_events (id,ticket_id,type,description,user_id,user_name,old_value,new_value,timestamp) VALUES (?,?,?,?,?,?,?,?,?)`, e
        );
    }
    console.log('  Events seeded');

    // Assets
    const assets = [
        ['a1', 'Dell Latitude 5540', 'laptop', 'Dell', 'Latitude 5540', 'DL5540-2024-001', 'active', 'u5', 'A. Turkmen', '2024-01-15', '2027-01-15', null],
        ['a2', 'HP LaserJet Pro M404', 'printer', 'HP', 'LaserJet Pro M404', 'HP-M404-002', 'maintenance', null, null, '2023-06-20', '2026-06-20', 'Kagit sikismasi sorunu'],
        ['a3', 'Cisco Catalyst 2960', 'switch', 'Cisco', 'Catalyst 2960', 'CC2960-003', 'active', null, null, '2023-03-10', '2028-03-10', null],
        ['a4', 'Dell OptiPlex 7090', 'desktop', 'Dell', 'OptiPlex 7090', 'DOP7090-004', 'active', 'u7', 'M. Ozturk', '2024-02-01', '2027-02-01', null],
        ['a5', 'iPhone 14 Pro', 'phone', 'Apple', 'iPhone 14 Pro', 'APL-IP14-005', 'active', 'u1', 'K. Yildirim', '2023-09-15', '2025-09-15', null],
        ['a6', 'Dell PowerEdge R740', 'server', 'Dell', 'PowerEdge R740', 'DPE-R740-006', 'active', null, null, '2022-11-01', '2027-11-01', 'Ana sunucu'],
        ['a7', 'Samsung Galaxy Tab S9', 'tablet', 'Samsung', 'Galaxy Tab S9', 'SGT-S9-007', 'storage', null, null, '2024-04-10', '2026-04-10', null],
        ['a8', 'Ubiquiti UniFi AP', 'access_point', 'Ubiquiti', 'UniFi AP AC Pro', 'UB-AP-008', 'active', null, null, '2023-07-01', '2028-07-01', '3. kat WiFi'],
    ];
    for (const a of assets) {
        await pool.query(
            `INSERT IGNORE INTO assets (id,name,type,brand,model,serial_number,status,assigned_to,assigned_to_name,purchase_date,warranty_end,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, a
        );
    }
    console.log('  Assets seeded');

    // Articles
    const articles = [
        ['kb1', 'VPN Baglanti Sorunlarini Giderme', 'Ag', 'VPN baglanti sorunlari icin adim adim rehber...', 'S. Arslan', '["VPN","Ag","Cisco"]', 234, 45, '2025-08-15 10:00:00', '2026-01-20 14:00:00'],
        ['kb2', 'Active Directory Sifre Sifirlama Proseduru', 'Erisim', 'AD sifre sifirlama adimlari ve politikalari...', 'B. Kaya', '["Sifre","Active-Directory","Hesap"]', 567, 89, '2025-06-01 09:00:00', '2026-02-15 11:00:00'],
        ['kb3', 'Yazici Kurulumu ve Sorun Giderme', 'Donanim', 'Ag yazicisi kurulumu ve genel sorunlar...', 'B. Kaya', '["Yazici","Donanim","Kurulum"]', 189, 32, '2025-09-20 14:00:00', '2026-02-01 10:00:00'],
        ['kb4', 'E-posta Imza Standartlari', 'E-posta', 'Kurumsal e-posta imza formati ve kurallari...', 'E. Demir', '["E-posta","Imza","Standart"]', 312, 21, '2025-07-10 11:00:00', '2026-01-15 09:00:00'],
        ['kb5', 'Bilgisayar Yavaslama Sorunlarina Ilk Mudahale', 'Yazilim', 'Performans sorunlari icin ilk yapilacak adimlar...', 'E. Demir', '["Performans","Yavaslama","Windows"]', 445, 67, '2025-10-01 08:00:00', '2026-02-20 16:00:00'],
    ];
    for (const a of articles) {
        await pool.query(
            `INSERT IGNORE INTO articles (id,title,category,content,author,tags,views,helpful,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`, a
        );
    }
    console.log('  Articles seeded');

    console.log('Database seeded successfully!');
    process.exit(0);
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
