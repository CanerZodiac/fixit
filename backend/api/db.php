<?php
/**
 * ==============================================================================
 * VERİTABANI BAĞLANTISI (MYSQL - PDO)
 * ==============================================================================
 * Canlı ortam için tüm hassas bilgiler environment variable'lardan okunuyor.
 * Vercel Dashboard > Settings > Environment Variables bölümüne eklemeyi unutma!
 */

// Önce Vercel env var'larına bak, yoksa local geliştirme için fallback değerleri kullan
$host    = getenv('DB_HOST')    ?: 'localhost';
$db      = getenv('DB_NAME')    ?: 'fixitdb';
$user    = getenv('DB_USER')    ?: 'root';
$pass    = getenv('DB_PASS')    ?: '';
$port    = getenv('DB_PORT')    ?: '3306';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";

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
