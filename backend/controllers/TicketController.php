<?php
/**
 * ==============================================================================
 * DESTEK BİLETİ (TICKET) YÖNETİCİSİ
 * ==============================================================================
 * Bilet açma, kapatma, ajan (uzman) atama ve mesajlaşma gibi işlemler burada.
 */
class TicketController {
    // Tüm biletleri en yeniden eskiye doğru listeler. (Dashboard'daki ana liste)
    public static function getAll($pdo) {
        $stmt = $pdo->query("SELECT * FROM tickets ORDER BY created_at DESC");
        $tickets = $stmt->fetchAll();
        
        // Frontend'in (React) çökmemesi için her biletin içine mesajlarını, olay geçmişini ve etiketlerini ekliyoruz.
        foreach ($tickets as &$ticket) {
            // Mesajları çek
            $stmtMsg = $pdo->prepare("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY timestamp ASC");
            $stmtMsg->execute([$ticket['id']]);
            $ticket['messages'] = $stmtMsg->fetchAll();
            
            // Olayları (Events) çek
            $stmtEvt = $pdo->prepare("SELECT * FROM ticket_events WHERE ticket_id = ? ORDER BY timestamp DESC");
            $stmtEvt->execute([$ticket['id']]);
            $ticket['events'] = $stmtEvt->fetchAll();
            
            // JSON formatındaki etiketleri diziye çevir
            $ticket['tags'] = $ticket['tags'] ? json_decode($ticket['tags']) : [];
        }
        
        echo json_encode($tickets);
    }

    // Belirli bir biletin (TKT-001 gibi) tüm detaylarını getirir.
    public static function getById($pdo, $id) {
        // Önce biletin kendi bilgilerini bul.
        $stmt = $pdo->prepare("SELECT * FROM tickets WHERE id = ?");
        $stmt->execute([$id]);
        $ticket = $stmt->fetch();
        
        if (!$ticket) {
            http_response_code(404); echo json_encode(['error' => 'Böyle bir bilet bulamadık.']); return;
        }
        
        // Biletin içine yazılan mesajları (sohbeti) eskidenden yeniye doğru çek.
        $stmtMsg = $pdo->prepare("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY timestamp ASC");
        $stmtMsg->execute([$id]);
        $ticket['messages'] = $stmtMsg->fetchAll();
        
        $stmtEvt = $pdo->prepare("SELECT * FROM ticket_events WHERE ticket_id = ? ORDER BY timestamp DESC");
        $stmtEvt->execute([$id]);
        $ticket['events'] = $stmtEvt->fetchAll();
        
        // Bileti açan kişinin profil fotoğrafını da ekleyelim ki arayüzde güzel dursun.
        $stmtUsr = $pdo->prepare("SELECT avatar FROM users WHERE id = ?");
        $stmtUsr->execute([$ticket['created_by']]);
        $usr = $stmtUsr->fetch();
        if ($usr) $ticket['created_by_avatar'] = $usr['avatar'];
        
        // Etiketler (Tags) veritabanında JSON string olarak tutuluyor, biz onları gerçek diziye (Array) çeviriyoruz.
        $ticket['tags'] = $ticket['tags'] ? json_decode($ticket['tags']) : [];
        
        echo json_encode($ticket);
    }

    // Yepyeni bir destek bileti oluşturduğumuz yer.
    public static function create($pdo, $input) {
        // Otomatik ID oluşturmak için kaç tane bilet olduğunu say. (örn: 5 bilet varsa yeni ID TKT-006 olur)
        $stmtCount = $pdo->query("SELECT COUNT(*) FROM tickets");
        $count = $stmtCount->fetchColumn();
        $id = "TKT-" . str_pad($count + 1, 3, "0", STR_PAD_LEFT);
        
        $stmt = $pdo->prepare("INSERT INTO tickets (id, title, description, category, priority, created_by, created_by_name) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $input['title'], $input['description'], $input['category'], $input['priority'], $input['createdBy'], $input['createdByName']]);
        
        echo json_encode(['id' => $id, 'success' => true]);
    }

    // Biletin durumunu (Açık, İşlemde, Çözüldü vb.) güncellediğimiz yer.
    public static function updateStatus($pdo, $id, $input) {
        $status = $input['status'];
        
        // Eğer bilet "çözüldü" veya "kapatıldı" olarak işaretleniyorsa o anın tarihini kaydediyoruz.
        $resolvedAt = ($status === 'resolved' || $status === 'closed') ? date('Y-m-d H:i:s') : null;
        
        $stmt = $pdo->prepare("UPDATE tickets SET status = ?, resolved_at = ? WHERE id = ?");
        $stmt->execute([$status, $resolvedAt, $id]);
        echo json_encode(['success' => true]);
    }

    // Bir bileti bir destek uzmanına atadığımız yer (Senin sevdiğin kısım!)
    public static function assign($pdo, $id, $input) {
        // Bileti kimin üzerine geçiriyoruz?
        $stmt = $pdo->prepare("UPDATE tickets SET assigned_to = ?, assigned_to_name = ? WHERE id = ?");
        $stmt->execute([$input['agentId'], $input['agentName'], $id]);
        
        // Not: Node.js versiyonunda burada otomatik mail atıyorduk, o kısım şimdilik basit tutuldu.
        echo json_encode(['success' => true]);
    }

    // Biletin içindeki sohbete mesaj gönderdiğimiz yer.
    public static function addMessage($pdo, $id, $input) {
        // Mesaja rastgele benzersiz bir kimlik veriyoruz.
        $msgId = uniqid('msg_');
        $stmt = $pdo->prepare("INSERT INTO ticket_messages (id, ticket_id, sender_id, sender_name, sender_role, content, is_internal) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$msgId, $id, $input['senderId'], $input['senderName'], $input['senderRole'], $input['content'], $input['isInternal'] ? 1 : 0]);
        echo json_encode(['success' => true]);
    }
}
