<?php
/**
 * ==============================================================================
 * KİMLİK DOĞRULAMA (AUTH) YÖNETİCİSİ
 * ==============================================================================
 * Giriş yapma (Login), Kayıt (Register), E-posta Doğrulama ve "Ben kimim?" (Me)
 * gibi güvenlik gerektiren işlemler burada döner.
 */
class AuthController {

    // Yeni kullanıcı kaydı
    public static function register($pdo, $input) {
        $name       = trim($input['name']       ?? '');
        $email      = trim($input['email']      ?? '');
        $password   = $input['password']        ?? '';
        $department = trim($input['department'] ?? '');

        // Basit doğrulama
        if (!$name || !$email || !$password || !$department) {
            http_response_code(400);
            echo json_encode(['error' => 'Tüm alanlar zorunludur.']);
            return;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Geçersiz e-posta adresi.']);
            return;
        }
        if (strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Şifre en az 6 karakter olmalıdır.']);
            return;
        }

        // E-posta daha önce kayıtlı mı?
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Bu e-posta adresi zaten kayıtlı.']);
            return;
        }

        // Yeni kullanıcı oluştur
        $userId           = 'u-' . uniqid();
        $passwordHash     = password_hash($password, PASSWORD_BCRYPT);
        $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $stmt = $pdo->prepare(
            "INSERT INTO users (id, name, email, password_hash, role, department, status, email_verified, verification_code)
             VALUES (?, ?, ?, ?, 'employee', ?, 'offline', 0, ?)"
        );
        $stmt->execute([$userId, $name, $email, $passwordHash, $department, $verificationCode]);

        // Gerçek uygulamada burada e-posta gönderilir.
        // Geliştirme ortamında kodu response'a da dönebiliriz (sadece test için):
        echo json_encode([
            'userId'           => $userId,
            'message'          => 'Kayıt başarılı. E-posta doğrulama kodunuzu girin.',
            // Geliştirme kolaylığı: Gerçek mailde bu satır olmamalı
            '_dev_code'        => $verificationCode,
        ]);
    }

    // E-posta doğrulama
    public static function verifyEmail($pdo, $input) {
        $userId = trim($input['userId'] ?? '');
        $code   = trim($input['code']   ?? '');

        if (!$userId || !$code) {
            http_response_code(400);
            echo json_encode(['error' => 'Kullanıcı ID ve kod zorunludur.']);
            return;
        }

        $stmt = $pdo->prepare("SELECT id, verification_code, email_verified FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Kullanıcı bulunamadı.']);
            return;
        }
        if ($user['email_verified']) {
            echo json_encode(['message' => 'E-posta zaten doğrulanmış.']);
            return;
        }
        if ($user['verification_code'] !== $code) {
            http_response_code(400);
            echo json_encode(['error' => 'Doğrulama kodu hatalı.']);
            return;
        }

        // Kodu onayla
        $pdo->prepare("UPDATE users SET email_verified = 1, verification_code = NULL WHERE id = ?")
            ->execute([$userId]);

        echo json_encode(['message' => 'E-posta başarıyla doğrulandı. Giriş yapabilirsiniz.']);
    }

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
