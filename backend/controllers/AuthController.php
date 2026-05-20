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
        $stmt = $pdo->prepare("SELECT id, email_verified FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $existingUser = $stmt->fetch();

        $userId           = 'u-' . uniqid();
        $passwordHash     = password_hash($password, PASSWORD_BCRYPT);
        $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        if ($existingUser) {
            if ($existingUser['email_verified'] == 1) {
                // Zaten onaylanmış bir hesap varsa, hata ver.
                http_response_code(409);
                echo json_encode(['error' => 'Bu e-posta adresi zaten kayıtlı ve doğrulanmış.']);
                return;
            } else {
                // Onaylanmamışsa, kaydı güncelle (yeniden kod gönderilecek)
                $userId = $existingUser['id']; // Eski ID'yi koru
                $stmt = $pdo->prepare("UPDATE users SET name = ?, password_hash = ?, department = ?, verification_code = ?, status = 'offline' WHERE id = ?");
                $stmt->execute([$name, $passwordHash, $department, $verificationCode, $userId]);
            }
        } else {
            // Hiç yoksa yeni kullanıcı oluştur
            $stmt = $pdo->prepare(
                "INSERT INTO users (id, name, email, password_hash, role, department, status, email_verified, verification_code)
                 VALUES (?, ?, ?, ?, 'employee', ?, 'offline', 0, ?)"
            );
            $stmt->execute([$userId, $name, $email, $passwordHash, $department, $verificationCode]);
        }

        // Gerçek mail gönderme işlemi (PHPMailer ile)
        try {
            require_once __DIR__ . '/../lib/PHPMailer/Exception.php';
            require_once __DIR__ . '/../lib/PHPMailer/PHPMailer.php';
            require_once __DIR__ . '/../lib/PHPMailer/SMTP.php';

            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);

            // Vercel env var'larına bak, yoksa fallback değerleri kullan (env.local'deki bilgiler)
            $mailHost = getenv('MAIL_HOST') ?: 'smtp.gmail.com';
            $mailPort = getenv('MAIL_PORT') ?: 587;
            $mailUser = getenv('MAIL_USER') ?: 'aydinerit@gmail.com';
            $mailPass = getenv('MAIL_PASS') ?: 'bhhlfpeldriwrsbs';

            $mail->isSMTP();
            $mail->Host       = $mailHost;
            $mail->SMTPAuth   = true;
            $mail->Username   = $mailUser;
            $mail->Password   = $mailPass;
            $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = $mailPort;
            $mail->CharSet    = 'UTF-8';

            $mail->setFrom($mailUser, 'FixIT Destek Merkezi');
            $mail->addAddress($email, $name);

            $mail->isHTML(true);
            $mail->Subject = 'Hesap Doğrulama Kodu - FixIT Destek Merkezi';
            
            // HTML Mail İçeriği (Şık ve modern tasarım)
            $mail->Body = "
            <div style='font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; text-align: center;'>
                <h2 style='color: #f59e0b;'>FixIT Destek Merkezi</h2>
                <p style='color: #555; font-size: 16px;'>Merhaba <strong>{$name}</strong>,</p>
                <p style='color: #555; font-size: 14px;'>Hesabınızı doğrulamak için aşağıdaki 6 haneli kodu kullanabilirsiniz:</p>
                <div style='background: #fef3c7; padding: 15px; margin: 20px 0; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #d97706;'>
                    {$verificationCode}
                </div>
                <p style='color: #999; font-size: 12px;'>Bu kodun süresi 30 dakika içinde dolacaktır.</p>
                <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;' />
                <p style='color: #aaa; font-size: 10px;'>FixIT v2.0 &copy; " . date('Y') . "</p>
            </div>
            ";

            $mail->send();
            
            echo json_encode([
                'userId'           => $userId,
                'message'          => 'Kayıt başarılı. E-posta doğrulama kodunuz gönderildi.',
            ]);
        } catch (Exception $e) {
            // E-posta gönderilemezse bile kullanıcı oluşturuldu, bunu loglayıp frontend'e bilgi verelim
            echo json_encode([
                'userId'           => $userId,
                'message'          => 'Kayıt başarılı ancak e-posta gönderilemedi. Lütfen IT departmanına başvurun.',
                'error'            => $mail->ErrorInfo
            ]);
        }
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
