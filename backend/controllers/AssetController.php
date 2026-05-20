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
    public static function create($pdo, $input) {
        $id = 'AST-' . substr(uniqid(), -6);
        $name = $input['name'] ?? '';
        $type = $input['type'] ?? '';
        $brand = $input['brand'] ?? '';
        $model = $input['model'] ?? '';
        $serialNumber = $input['serialNumber'] ?? '';
        $department = $input['department'] ?? '';
        $location = $input['location'] ?? '';
        $purchaseDate = $input['purchaseDate'] ?? null;
        $warrantyEnd = $input['warrantyEnd'] ?? null;
        $status = $input['status'] ?? 'active';
        $assignedTo = $input['assignedTo'] ?? null;
        $assignedToName = $input['assignedToName'] ?? null;

        $stmt = $pdo->prepare("INSERT INTO assets (id, name, type, brand, model, serial_number, department, location, purchase_date, warranty_end, status, assigned_to, assigned_to_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $name, $type, $brand, $model, $serialNumber, $department, $location, $purchaseDate, $warrantyEnd, $status, $assignedTo, $assignedToName]);
        echo json_encode(['success' => true, 'id' => $id]);
    }

    public static function update($pdo, $id, $input) {
        $name = $input['name'] ?? null;
        $type = $input['type'] ?? null;
        $brand = $input['brand'] ?? null;
        $model = $input['model'] ?? null;
        $serialNumber = $input['serialNumber'] ?? null;
        $department = $input['department'] ?? null;
        $location = $input['location'] ?? null;
        $purchaseDate = $input['purchaseDate'] ?? null;
        $warrantyEnd = $input['warrantyEnd'] ?? null;
        
        $fields = [];
        $values = [];

        if ($name) { $fields[] = "name = ?"; $values[] = $name; }
        if ($type) { $fields[] = "type = ?"; $values[] = $type; }
        if ($brand) { $fields[] = "brand = ?"; $values[] = $brand; }
        if ($model) { $fields[] = "model = ?"; $values[] = $model; }
        if ($serialNumber) { $fields[] = "serial_number = ?"; $values[] = $serialNumber; }
        if ($department) { $fields[] = "department = ?"; $values[] = $department; }
        if ($location) { $fields[] = "location = ?"; $values[] = $location; }
        if ($purchaseDate) { $fields[] = "purchase_date = ?"; $values[] = $purchaseDate; }
        if ($warrantyEnd) { $fields[] = "warranty_end = ?"; $values[] = $warrantyEnd; }

        if (count($fields) > 0) {
            $values[] = $id;
            $stmt = $pdo->prepare("UPDATE assets SET " . implode(', ', $fields) . " WHERE id = ?");
            $stmt->execute($values);
        }
        echo json_encode(['success' => true]);
    }

    public static function delete($pdo, $id) {
        $stmt = $pdo->prepare("DELETE FROM assets WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }

    public static function updateStatus($pdo, $id, $input) {
        $status = $input['status'] ?? 'active';
        $stmt = $pdo->prepare("UPDATE assets SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);
        echo json_encode(['success' => true]);
    }

    public static function assign($pdo, $id, $input) {
        $assignedTo = $input['assignedTo'] ?? null;
        $assignedToName = $input['assignedToName'] ?? null;
        $stmt = $pdo->prepare("UPDATE assets SET assigned_to = ?, assigned_to_name = ? WHERE id = ?");
        $stmt->execute([$assignedTo, $assignedToName, $id]);
        echo json_encode(['success' => true]);
    }
}
