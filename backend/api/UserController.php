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
    public static function create($pdo, $input) {
        $id = 'u-' . uniqid();
        $name = $input['name'] ?? '';
        $email = $input['email'] ?? '';
        $passwordHash = password_hash($input['password'] ?? '123456', PASSWORD_BCRYPT);
        $role = $input['role'] ?? 'employee';
        $department = $input['department'] ?? '';
        $phone = $input['phone'] ?? null;
        $title = $input['title'] ?? null;

        $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password_hash, role, department, phone, title, status, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', 1)");
        $stmt->execute([$id, $name, $email, $passwordHash, $role, $department, $phone, $title]);

        echo json_encode(['success' => true, 'id' => $id]);
    }

    public static function update($pdo, $id, $input) {
        $name = $input['name'] ?? null;
        $email = $input['email'] ?? null;
        $role = $input['role'] ?? null;
        $department = $input['department'] ?? null;
        $phone = $input['phone'] ?? null;
        $title = $input['title'] ?? null;

        $fields = [];
        $values = [];

        if ($name) { $fields[] = "name = ?"; $values[] = $name; }
        if ($email) { $fields[] = "email = ?"; $values[] = $email; }
        if ($role) { $fields[] = "role = ?"; $values[] = $role; }
        if ($department) { $fields[] = "department = ?"; $values[] = $department; }
        if (isset($input['phone'])) { $fields[] = "phone = ?"; $values[] = $phone; }
        if (isset($input['title'])) { $fields[] = "title = ?"; $values[] = $title; }

        if (isset($input['passwordHash']) && !empty($input['passwordHash'])) {
            $fields[] = "password_hash = ?";
            $values[] = password_hash($input['passwordHash'], PASSWORD_BCRYPT);
        }

        if (count($fields) > 0) {
            $values[] = $id;
            $stmt = $pdo->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?");
            $stmt->execute($values);
        }
        echo json_encode(['success' => true]);
    }

    public static function toggleStatus($pdo, $id, $input) {
        $status = $input['status'] ?? 'active';
        $stmt = $pdo->prepare("UPDATE users SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);
        echo json_encode(['success' => true]);
    }

    public static function delete($pdo, $id) {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
}
