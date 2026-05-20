<?php
/**
 * ==============================================================================
 * KİMLİK DOĞRULAMA (AUTH) YÖNETİCİSİ
 * ==============================================================================
 * Giriş yapma (Login) ve "Ben kimim?" (Me) gibi güvenlik gerektiren işlemler burada döner.
 */
class AuthController {
    // Kullanıcı giriş yapmaya çalıştığında çalışan fonksiyon
    public static function login($pdo, $input) {
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';
        
        // Önce veritabanına gidip "Böyle bir e-posta var mı?" diye soruyoruz.
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        // Eğer kullanıcı bulunduysa ve girdiği şifre veritabanındaki şifrelenmiş (hash) şifreyle eşleşiyorsa...
        if ($user && password_verify($password, $user['password_hash'])) {
            // Şifre doğru! Artık ona içeride gezeceği bir ziyaretçi kartı (JWT Token) vermeliyiz.
            // PHP'de harici kütüphane kullanmadan kendi basit JWT tokenimizi üretiyoruz.
            $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
            $payload = json_encode([
                'id' => $user['id'],
                'role' => $user['role'],
                'email' => $user['email'],
                'exp' => time() + 86400
            ]);
            $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
            $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
            
            // Kartın sahte olmadığını kanıtlamak için gizli şifremizle (secret key) mühürlüyoruz.
            $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, 'super-fort-knox-secret-key-fixit', true);
            $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
            
            // Üç parçayı birleştirip efsanevi JWT token'imizi elde ediyoruz.
            $token = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
            
            // Kullanıcının sisteme girdiği anı veritabanına kaydediyoruz (Son görülme).
            $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?")->execute([$user['id']]);
            
            // Şifresini kazara frontend'e (React) göndermemek için siliyoruz, aman dikkat!
            unset($user['password_hash']);
            
            // Buyrun, işte giriş izniniz (token) ve profil bilgileriniz (user).
            echo json_encode(['token' => $token, 'user' => $user]);
        } else {
            // Şifre yanlışsa kapıdan geri çeviriyoruz.
            http_response_code(401);
            echo json_encode(['error' => 'Geçersiz e-posta veya şifre. Lütfen tekrar deneyin.']);
        }
    }

    // Frontend her sayfa yenilendiğinde "Acaba hala giriş yapmış mıyım?" diye buraya sorar.
    public static function me($pdo, $userPayload) {
        // Token'den aldığımız ID ile veritabanından güncel profilini çekiyoruz.
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userPayload['id']]);
        $user = $stmt->fetch();
        if ($user) {
            echo json_encode(['user' => $user]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Kullanıcı bulunamadı']);
        }
    }
}
