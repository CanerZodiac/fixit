<?php
/**
 * ==============================================================================
 * BİLGİ BANKASI (ARTICLE) YÖNETİCİSİ
 * ==============================================================================
 * Kullanıcıların "Şifremi nasıl sıfırlarım?" gibi soruları için hazırlanan
 * yardım makalelerini arama ve listeleme işlemlerini yapar.
 */
class ArticleController {
    // Belirli bir kategoriye (Örn: 'network', 'hardware') ait makaleleri getirir.
    public static function getByCategory($pdo, $cat) {
        $stmt = $pdo->prepare("SELECT * FROM articles WHERE category = ?");
        $stmt->execute([$cat]);
        $rows = $stmt->fetchAll();
        
        // Etiketleri (tags) JSON formatından çıkarıp diziye (Array) çeviriyoruz.
        foreach($rows as &$row) {
            $row['tags'] = $row['tags'] ? json_decode($row['tags']) : [];
        }
        echo json_encode($rows);
    }
    
    // Kullanıcı arama kutusuna "yazıcı" yazdığında içinde o kelime geçen makaleleri bulur.
    public static function search($pdo, $q) {
        // LIKE %kelime% diyerek makalenin başlığında veya içeriğinde arama yapıyoruz.
        $stmt = $pdo->prepare("SELECT * FROM articles WHERE title LIKE ? OR content LIKE ?");
        $stmt->execute(["%$q%", "%$q%"]);
        $rows = $stmt->fetchAll();
        foreach($rows as &$row) {
            $row['tags'] = $row['tags'] ? json_decode($row['tags']) : [];
        }
        echo json_encode($rows);
    }
}
