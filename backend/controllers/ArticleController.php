<?php
/**
 * ==============================================================================
 * BİLGİ BANKASI (ARTICLE) YÖNETİCİSİ
 * ==============================================================================
 * Bilgi bankası makalelerinin tüm CRUD işlemlerini yönetir.
 * - getAll       : Tüm makaleleri listeler (arama ve kategori filtresiyle)
 * - getById      : Tek makaleyi getirir ve görüntülenme sayısını artırır
 * - create       : Yeni makale ekler (admin/agent)
 * - update       : Mevcut makaleyi günceller (admin/agent)
 * - delete       : Makaleyi siler (admin)
 * - markHelpful  : "Faydalı" / "Faydalı değil" oylaması
 * - getByCategory: Kategoriye göre filtrele
 * - search       : Başlık ve içerikte arama yap
 */
class ArticleController {

    // ──────────────────────────────────────────────
    // YARDIMCI: Tek satır etiket çözme
    // ──────────────────────────────────────────────
    private static function decodeTags(array &$rows): void {
        foreach ($rows as &$row) {
            $row['tags'] = !empty($row['tags']) ? json_decode($row['tags'], true) : [];
            // camelCase mapping (frontend beklentisi)
            $row['createdAt'] = $row['created_at'] ?? null;
            $row['updatedAt'] = $row['updated_at'] ?? null;
            unset($row['created_at'], $row['updated_at']);
        }
    }

    private static function decodeOne(array &$row): void {
        $row['tags'] = !empty($row['tags']) ? json_decode($row['tags'], true) : [];
        $row['createdAt'] = $row['created_at'] ?? null;
        $row['updatedAt'] = $row['updated_at'] ?? null;
        unset($row['created_at'], $row['updated_at']);
    }

    // ──────────────────────────────────────────────
    // GET /api/articles  →  Tüm makaleleri listele
    // Opsiyonel query parametreleri: ?search=&category=
    // ──────────────────────────────────────────────
    public static function getAll($pdo): void {
        $search   = trim($_GET['search']   ?? '');
        $category = trim($_GET['category'] ?? '');

        $sql    = "SELECT * FROM articles WHERE 1=1";
        $params = [];

        if ($search !== '') {
            $sql    .= " AND (title LIKE ? OR content LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        if ($category !== '' && $category !== 'all') {
            $sql    .= " AND category = ?";
            $params[] = $category;
        }

        $sql .= " ORDER BY views DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        self::decodeTags($rows);
        echo json_encode(array_values($rows));
    }

    // ──────────────────────────────────────────────
    // GET /api/articles/{id}  →  Tek makale + görüntülenme ++
    // ──────────────────────────────────────────────
    public static function getById($pdo, string $id): void {
        // Görüntülenme sayısını artır
        $pdo->prepare("UPDATE articles SET views = views + 1 WHERE id = ?")->execute([$id]);

        $stmt = $pdo->prepare("SELECT * FROM articles WHERE id = ?");
        $stmt->execute([$id]);
        $row  = $stmt->fetch();

        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Makale bulunamadı']);
            return;
        }

        self::decodeOne($row);
        echo json_encode($row);
    }

    // ──────────────────────────────────────────────
    // POST /api/articles  →  Yeni makale oluştur
    // ──────────────────────────────────────────────
    public static function create($pdo, array $input): void {
        $title    = trim($input['title']    ?? '');
        $category = trim($input['category'] ?? '');
        $content  = trim($input['content']  ?? '');
        $author   = trim($input['author']   ?? 'Anonim');
        $authorId = $input['authorId']      ?? null;
        $tags     = $input['tags']          ?? [];

        if ($title === '' || $category === '' || $content === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Başlık, kategori ve içerik zorunludur.']);
            return;
        }

        $id = 'kb-' . uniqid();

        $stmt = $pdo->prepare(
            "INSERT INTO articles (id, title, category, content, author, author_id, tags, views, helpful)
             VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)"
        );
        $stmt->execute([
            $id, $title, $category, $content,
            $author, $authorId,
            json_encode($tags, JSON_UNESCAPED_UNICODE)
        ]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $id]);
    }

    // ──────────────────────────────────────────────
    // PUT /api/articles/{id}  →  Makale güncelle
    // ──────────────────────────────────────────────
    public static function update($pdo, string $id, array $input): void {
        $stmt = $pdo->prepare("SELECT id FROM articles WHERE id = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Makale bulunamadı']);
            return;
        }

        $fields = [];
        $params = [];

        if (isset($input['title'])) {
            $fields[] = "title = ?";
            $params[] = trim($input['title']);
        }
        if (isset($input['category'])) {
            $fields[] = "category = ?";
            $params[] = trim($input['category']);
        }
        if (isset($input['content'])) {
            $fields[] = "content = ?";
            $params[] = trim($input['content']);
        }
        if (isset($input['author'])) {
            $fields[] = "author = ?";
            $params[] = trim($input['author']);
        }
        if (isset($input['tags'])) {
            $fields[] = "tags = ?";
            $params[] = json_encode($input['tags'], JSON_UNESCAPED_UNICODE);
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'Güncellenecek alan bulunamadı.']);
            return;
        }

        $params[] = $id;
        $sql = "UPDATE articles SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";
        $pdo->prepare($sql)->execute($params);

        echo json_encode(['success' => true]);
    }

    // ──────────────────────────────────────────────
    // DELETE /api/articles/{id}  →  Makale sil
    // ──────────────────────────────────────────────
    public static function delete($pdo, string $id): void {
        $stmt = $pdo->prepare("SELECT id FROM articles WHERE id = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Makale bulunamadı']);
            return;
        }

        $pdo->prepare("DELETE FROM articles WHERE id = ?")->execute([$id]);
        echo json_encode(['success' => true]);
    }

    // ──────────────────────────────────────────────
    // POST /api/articles/{id}/helpful  →  Oylama
    // Body: { "type": "helpful" | "not_helpful" }
    // ──────────────────────────────────────────────
    public static function markHelpful($pdo, string $id, array $input): void {
        $type = $input['type'] ?? 'helpful';

        $col = $type === 'not_helpful' ? 'not_helpful_count' : 'helpful';

        $stmt = $pdo->prepare("SELECT id FROM articles WHERE id = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Makale bulunamadı']);
            return;
        }

        $pdo->prepare("UPDATE articles SET $col = $col + 1 WHERE id = ?")->execute([$id]);
        echo json_encode(['success' => true]);
    }

    // ──────────────────────────────────────────────
    // GET /api/articles/category/{cat}  →  Kategori filtresi
    // ──────────────────────────────────────────────
    public static function getByCategory($pdo, string $cat): void {
        $stmt = $pdo->prepare("SELECT * FROM articles WHERE category = ? ORDER BY views DESC");
        $stmt->execute([$cat]);
        $rows = $stmt->fetchAll();
        self::decodeTags($rows);
        echo json_encode(array_values($rows));
    }

    // ──────────────────────────────────────────────
    // GET /api/articles/search?q=  →  Metin arama
    // ──────────────────────────────────────────────
    public static function search($pdo, string $q): void {
        $stmt = $pdo->prepare(
            "SELECT * FROM articles WHERE title LIKE ? OR content LIKE ? ORDER BY views DESC"
        );
        $stmt->execute(["%$q%", "%$q%"]);
        $rows = $stmt->fetchAll();
        self::decodeTags($rows);
        echo json_encode(array_values($rows));
    }
}
