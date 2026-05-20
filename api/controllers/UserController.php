<?php
/**
 * ==============================================================================
 * KULLANICI (USER) YÖNETİCİSİ
 * ==============================================================================
 * Sistemdeki çalışanları, destek uzmanlarını ve yöneticileri listelemek için kullanılır.
 */
class UserController {
    // Sistemdeki herkesi (yönetici, uzman, çalışan) tek bir listede toplar. (Kullanıcı Yönetimi sayfası için)
    public static function getAll($pdo) {
        // Şifreleri (password_hash) hariç tutup, güvenli olan tüm bilgileri çekiyoruz.
        $stmt = $pdo->query("SELECT id, name, email, role, avatar, department, title, bio, timezone, language, phone, status, tickets_closed, avg_response_minutes FROM users ORDER BY name");
        echo json_encode($stmt->fetchAll());
    }

    // Sadece belirli bir role sahip olanları getirir.
    // Mesela "Bana sadece destek uzmanlarını (agent) ver, bilet atayacağım" dediğimizde burası çalışır.
    public static function getByRole($pdo, $role) {
        $stmt = $pdo->prepare("SELECT id, name, email, role, avatar, department FROM users WHERE role = ?");
        $stmt->execute([$role]);
        echo json_encode($stmt->fetchAll());
    }
}
