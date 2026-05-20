<?php
/**
 * ==============================================================================
 * İSTATİSTİK VE DASHBOARD YÖNETİCİSİ
 * ==============================================================================
 * Ana sayfadaki (Dashboard) o güzel kartların ve grafiklerin verilerini 
 * hazırlayıp Frontend'e gönderdiğimiz yer.
 */
class StatsController {
    // Dashboard'u açan kişiye anlık genel durumu (Özet) döndürür
    public static function getDashboard($pdo) {
        // Veritabanına tek tek soruyoruz: Kaç açık bilet var? Kaç tane çözülmüş?
        $open = $pdo->query("SELECT COUNT(*) FROM tickets WHERE status = 'open'")->fetchColumn();
        $inProgress = $pdo->query("SELECT COUNT(*) FROM tickets WHERE status = 'in_progress'")->fetchColumn();
        $resolved = $pdo->query("SELECT COUNT(*) FROM tickets WHERE status = 'resolved'")->fetchColumn();
        $total = $pdo->query("SELECT COUNT(*) FROM tickets")->fetchColumn();
        
        // Tüm bu rakamları temiz bir paket (Dizi/Array) haline getiriyoruz
        $stats = [
            'total_tickets' => (int)$total,
            'open_tickets' => (int)$open,
            'in_progress' => (int)$inProgress,
            'resolved_today' => (int)$resolved,
            'avg_response_time' => 15, // Ortalama yanıt süresi (şimdilik sabit)
            'csat_score' => 4.8        // Müşteri memnuniyet skoru (şimdilik sabit)
        ];
        
        // Grafikler (Chart) için geriye dönük 7 günlük uydurma (Mock) veri üretiyoruz.
        // İleride gerçek SQL sorgusuyla (GROUP BY DATE) değiştirilebilir.
        for ($i=6; $i>=0; $i--) {
            $trend[] = [
                'date' => date('Y-m-d', strtotime("-$i days")),
                'resolved' => rand(5, 20),
                'created' => rand(10, 25)
            ];
        }
        
        echo json_encode(['stats' => $stats, 'trend' => $trend]);
    }
}
