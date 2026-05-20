<?php
/**
 * ==============================================================================
 * ANA YÖNLENDİRİCİ (FRONT CONTROLLER) - PROJENİN KALBİ
 * ==============================================================================
 * Burası bizim resepsiyonumuz. React'ten (Frontend) gelen her istek önce kapıdan 
 * (index.php) girer. Biz de gelen misafire (isteğe) bakarız; "Sen biletlere mi geldin?
 * Yoksa giriş mi yapacaksın?" diyerek ilgili Controller'a yönlendiririz.
 */

// Tarayıcıların "Bu site güvenli mi?" diyerek attığı ön kontrollere (CORS) izin veriyoruz.
// Frontend 3000 portunda, backend 3001'de olduğu için bu ayarlar şart, yoksa tarayıcı bloklar.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// React (Frontend) tarafıyla konuşacağımız için her zaman JSON formatında yanıt dönüyoruz.
header('Content-Type: application/json');

// Veritabanına (MySQL) bağlanmamızı sağlayan dosyayı dahil ediyoruz. 
require_once 'db.php';

// Ziyaretçi hangi sayfayı (endpoint) istiyor? (Örn: /api/tickets)
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Ziyaretçi bizden veri mi istiyor (GET), yoksa yeni veri mi gönderiyor (POST)?
$method = $_SERVER['REQUEST_METHOD'];

// Frontend'deki kodlar istekleri "/api/..." diyerek gönderiyor. 
// Klasör yapısında karmaşa olmaması için baştaki "/api" kısmını siliyoruz.
if (strpos($request_uri, '/api') === 0) {
    $request_uri = substr($request_uri, 4);
}
if ($request_uri === '') $request_uri = '/';

// Ziyaretçi eğer bize bir form veya JSON veri göndermişse, onu alıp PHP'nin anlayacağı bir diziye çeviriyoruz.
$input = json_decode(file_get_contents('php://input'), true) ?? [];

/**
 * OTURUM KONTROLÜ (Güvenlik Görevlisi)
 * Kullanıcı sisteme giriş yapmış mı? Elinde geçerli bir bileti (JWT Token) var mı?
 */
function verifyToken() {
    // Tarayıcının gönderdiği Authorization (Kimlik) başlığını okuyoruz.
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!$authHeader) {
        http_response_code(401); echo json_encode(['error' => 'Oturum bulunamadı']); exit;
    }
    $parts = explode(' ', $authHeader);
    if (count($parts) !== 2) {
        http_response_code(403); echo json_encode(['error' => 'Geçersiz oturum']); exit;
    }
    $tokenParts = explode('.', $parts[1]);
    if (count($tokenParts) !== 3) {
        http_response_code(403); echo json_encode(['error' => 'Geçersiz oturum formatı']); exit;
    }
    // Biletin içindeki asıl bilgiyi (kullanıcı id, rol vs.) base64 formatından çözüyoruz.
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1])), true);
    if (!$payload) {
        http_response_code(403); echo json_encode(['error' => 'Geçersiz oturum verisi']); exit;
    }
    
    // Eğer her şey yolundaysa, kullanıcının bilgilerini geri döndürüyoruz ki içeride kime işlem yaptığımızı bilelim.
    return $payload;
}

// Projede ne kadar Controller (Bilet Yöneticisi, Kullanıcı Yöneticisi vb.) varsa hepsini tek seferde sisteme yüklüyoruz.
foreach (glob(__DIR__ . '/controllers/*.php') as $filename) {
    require_once $filename;
}

try {
    /**
     * SANTRAL / YÖNLENDİRME (ROUTER)
     * Burası tam olarak santral. "Şu numarayı tuşladınız, sizi oraya bağlıyorum" diyen kısım.
     */
    
    // -- KİMLİK DOĞRULAMA (AUTH) İŞLEMLERİ --
    if (preg_match('#^/auth/register$#', $request_uri) && $method === 'POST') {
        // Yeni kullanıcı kayıt olmak istiyorsa AuthController::register'a yönlendir.
        AuthController::register($pdo, $input);
    } elseif (preg_match('#^/auth/verify-email$#', $request_uri) && $method === 'POST') {
        // Kullanıcı e-posta doğrulama kodu giriyorsa burada işle.
        AuthController::verifyEmail($pdo, $input);
    } elseif (preg_match('#^/auth/login$#', $request_uri) && $method === 'POST') {
        // Kullanıcı giriş yapmak istiyorsa AuthController'daki login metoduna yönlendir.
        AuthController::login($pdo, $input);
    } elseif (preg_match('#^/auth/me$#', $request_uri) && $method === 'GET') {
        // Profil bilgilerini istiyorsa, önce güvenliği (verifyToken) geçmesi lazım.
        $user = verifyToken();
        AuthController::me($pdo, $user);
        
    // -- DESTEK BİLETİ (TİCKET) İŞLEMLERİ --
    } elseif (preg_match('#^/tickets$#', $request_uri) && $method === 'GET') {
        TicketController::getAll($pdo); // Tüm biletleri listele
    } elseif (preg_match('#^/tickets$#', $request_uri) && $method === 'POST') {
        TicketController::create($pdo, $input); // Yeni bilet aç
    } elseif (preg_match('#^/tickets/([^/]+)$#', $request_uri, $matches) && $method === 'GET') {
        TicketController::getById($pdo, $matches[1]); // Belirli bir biletin detaylarını getir
    } elseif (preg_match('#^/tickets/([^/]+)/status$#', $request_uri, $matches) && $method === 'PUT') {
        TicketController::updateStatus($pdo, $matches[1], $input); // Biletin durumunu (Çözüldü, Kapatıldı) değiştir
    } elseif (preg_match('#^/tickets/([^/]+)/assign$#', $request_uri, $matches) && $method === 'PUT') {
        TicketController::assign($pdo, $matches[1], $input); // Bileti bir destek uzmanına ata
    } elseif (preg_match('#^/tickets/([^/]+)/messages$#', $request_uri, $matches) && $method === 'POST') {
        TicketController::addMessage($pdo, $matches[1], $input); // Bilete cevap / mesaj yaz
    } elseif (preg_match('#^/tickets/([^/]+)/priority$#', $request_uri, $matches) && $method === 'PUT') {
        TicketController::updatePriority($pdo, $matches[1], $input); // Öncelik güncelle
        
    // -- KULLANICI (USER) İŞLEMLERİ --
    } elseif (preg_match('#^/users$#', $request_uri) && $method === 'GET') {
        UserController::getAll($pdo); // Tüm personelleri listele
    } elseif (preg_match('#^/users$#', $request_uri) && $method === 'POST') {
        UserController::create($pdo, $input); // Yeni kullanıcı ekle
    } elseif (preg_match('#^/users/([^/]+)$#', $request_uri, $matches) && $method === 'PUT') {
        UserController::update($pdo, $matches[1], $input); // Kullanıcı güncelle
    } elseif (preg_match('#^/users/([^/]+)$#', $request_uri, $matches) && $method === 'DELETE') {
        UserController::delete($pdo, $matches[1]); // Kullanıcı sil
    } elseif (preg_match('#^/users/([^/]+)/status$#', $request_uri, $matches) && $method === 'PUT') {
        UserController::toggleStatus($pdo, $matches[1], $input); // Durum değiştir (aktif/pasif)
    } elseif (preg_match('#^/users/role/([^/]+)$#', $request_uri, $matches) && $method === 'GET') {
        UserController::getByRole($pdo, $matches[1]); // Sadece belirli yetkideki (örn: agent) kullanıcıları getir
        
    // -- ENVANTER VE BİLGİ BANKASI --
    } elseif (preg_match('#^/assets$#', $request_uri) && $method === 'GET') {
        AssetController::getAll($pdo); // Bilgisayar, monitör gibi zimmetli eşyaları listele
    } elseif (preg_match('#^/assets$#', $request_uri) && $method === 'POST') {
        AssetController::create($pdo, $input); // Yeni envanter ekle
    } elseif (preg_match('#^/assets/([^/]+)$#', $request_uri, $matches) && $method === 'PUT') {
        AssetController::update($pdo, $matches[1], $input); // Envanter güncelle
    } elseif (preg_match('#^/assets/([^/]+)$#', $request_uri, $matches) && $method === 'DELETE') {
        AssetController::delete($pdo, $matches[1]); // Envanter sil
    } elseif (preg_match('#^/assets/([^/]+)/status$#', $request_uri, $matches) && $method === 'PUT') {
        AssetController::updateStatus($pdo, $matches[1], $input); // Durum güncelle
    } elseif (preg_match('#^/assets/([^/]+)/assign$#', $request_uri, $matches) && $method === 'PUT') {
        AssetController::assign($pdo, $matches[1], $input); // Zimmetle

    // -- BİLGİ BANKASI (ARTICLES) --
    } elseif (preg_match('#^/articles$#', $request_uri) && $method === 'GET') {
        ArticleController::getAll($pdo); // Tüm makaleleri listele (?search=&category= destekli)
    } elseif (preg_match('#^/articles$#', $request_uri) && $method === 'POST') {
        ArticleController::create($pdo, $input); // Yeni makale ekle
    } elseif (preg_match('#^/articles/search$#', $request_uri) && $method === 'GET') {
        ArticleController::search($pdo, $_GET['q'] ?? ''); // Metin araması
    } elseif (preg_match('#^/articles/category/([^/]+)$#', $request_uri, $matches) && $method === 'GET') {
        ArticleController::getByCategory($pdo, $matches[1]); // Kategoriye göre filtrele
    } elseif (preg_match('#^/articles/([^/]+)/helpful$#', $request_uri, $matches) && $method === 'POST') {
        ArticleController::markHelpful($pdo, $matches[1], $input); // Faydalı oyla
    } elseif (preg_match('#^/articles/([^/]+)$#', $request_uri, $matches) && $method === 'GET') {
        ArticleController::getById($pdo, $matches[1]); // Tek makale getir (views++)
    } elseif (preg_match('#^/articles/([^/]+)$#', $request_uri, $matches) && $method === 'PUT') {
        ArticleController::update($pdo, $matches[1], $input); // Makale güncelle
    } elseif (preg_match('#^/articles/([^/]+)$#', $request_uri, $matches) && $method === 'DELETE') {
        ArticleController::delete($pdo, $matches[1]); // Makale sil
        
    // -- YAPAY ZEKA VE İSTATİSTİKLER --
    } elseif (preg_match('#^/chat$#', $request_uri) && $method === 'POST') {
        ChatController::sendMessage($input); // Yapay zeka canlı destek asistanına mesaj at
    } elseif (preg_match('#^/stats/dashboard$#', $request_uri) && $method === 'GET') {
        StatsController::getDashboard($pdo); // Ana sayfadaki grafikleri ve istatistikleri getir
        
    // -- YANLIŞ ADRES --
    } else {
        // Ziyaretçi olmayan bir adrese gitmeye çalıştıysa 404 (Bulunamadı) hatası veriyoruz.
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint bulunamadı: ' . $request_uri]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Sunucu hatası: ' . $e->getMessage()]);
}
