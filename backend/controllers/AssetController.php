<?php
/**
 * ==============================================================================
 * ZİMMET VE ENVANTER (ASSET) YÖNETİCİSİ
 * ==============================================================================
 * Şirketteki bilgisayarlar, monitörler kime zimmetli? Hangi cihaz nerede?
 * Tüm bu donanım listesini çekmek için kullanıyoruz.
 */
class AssetController {
    // Depodaki tüm cihazları yenilik sırasına göre listeler.
    public static function getAll($pdo) {
        $stmt = $pdo->query("SELECT * FROM assets ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
    }
}
