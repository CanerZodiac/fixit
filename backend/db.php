<?php
/**
 * ==============================================================================
 * VERİTABANI BAĞLANTISI (MYSQL - PDO)
 * ==============================================================================
 * Burası bizim bilgi depomuza (MySQL) bağlanan kablomuz. Sistemdeki tüm 
 * controller'lar bu dosyayı çağırarak veritabanıyla güvenli bir şekilde konuşur.
 */

// Sunucu bilgileri (Kendi bilgisayarımızda çalıştığı için localhost)
$host = 'localhost';
$db   = 'fixitdb';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

// PDO Ayarları: Bu kısım bağlantının nasıl davranacağını belirliyor.
$options = [
    // Bir hata olursa sessiz kalma, bize hemen bildir ki çözelim (Hata Ayıklama)
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    // Verileri çekerken gereksiz rakamsal anahtarlar yerine sadece kolon isimlerini getir (Daha temiz veri)
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    // Güvenlik (SQL Injection koruması) için PHP yerine veritabanının kendi hazırlayıcısını kullan
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    // Kapıyı çalıyoruz ve veritabanı bağlantımızı ($pdo) oluşturuyoruz.
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // Eğer şifre yanlışsa, veritabanı silinmişse veya MySQL kapalıysa buraya düşeriz.
    // Kullanıcıya çirkin bir hata göstermek yerine JSON formatında zarifçe "Bağlanamadım" diyoruz.
    http_response_code(500);
    echo json_encode(["error" => "Veritabanı bağlantı hatası: " . $e->getMessage()]);
    exit;
}
