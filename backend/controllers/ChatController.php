<?php
/**
 * ==============================================================================
 * YAPAY ZEKA CANLI DESTEK (MOCK AI)
 * ==============================================================================
 * Google Gemini API anahtarı olmadığı durumlarda hayat kurtaran, kural tabanlı 
 * sahte yapay zeka asistanımız. Kullanıcıların sık sorduğu soruları anahtar 
 * kelimelerden yakalayıp insansı cevaplar verir.
 */
class ChatController {
    // Kullanıcının yazdığı mesajı alıp cevap ürettiğimiz yer
    public static function sendMessage($input) {
        // Gelen mesajı tamamen küçük harfe çeviriyoruz ki büyük/küçük harf duyarlılığı olmasın
        $message = mb_strtolower($input['message'] ?? '', 'UTF-8');
        
        // Eğer hiçbir kelimeyle eşleşmezse verilecek varsayılan (toparlayıcı) cevap
        $responseText = "Anladım. Sorununuzu tam olarak çözebilmemiz için detay verebilir misiniz veya sol menüden yeni bir destek bileti açabilirsiniz.";
        
        // İçinde 'vpn' kelimesi geçiyorsa...
        if (strpos($message, 'vpn') !== false || strpos($message, 'bağlanamıyorum') !== false) {
            $responseText = "VPN bağlantı sorunları için öncelikle 'Cisco AnyConnect' uygulamanızı yönetici olarak çalıştırın. Düzelmezse IT ağ ekibine bir bilet açmanız gerekmektedir.";
        
        // İçinde şifre/parola geçiyorsa...
        } elseif (strpos($message, 'şifre') !== false || strpos($message, 'parola') !== false) {
            $responseText = "Şifrenizi unuttuysanız, giriş ekranındaki 'Şifremi Unuttum' seçeneğinden sıfırlayabilirsiniz. Windows şifreniz kilitlendiyse 1234 dahili numarasından IT'yi arayabilirsiniz.";
        
        // İçinde yazıcı/çıktı geçiyorsa...
        } elseif (strpos($message, 'yazıcı') !== false || strpos($message, 'çıktı') !== false) {
            $responseText = "Yazıcı sorunlarında donanımsal bir hata olabilir. Ekranda kağıt sıkışması (paper jam) veya toner uyarısı var mı kontrol edin.";
        
        // Selamlaşıyorsa...
        } elseif (strpos($message, 'merhaba') !== false || strpos($message, 'selam') !== false) {
            $responseText = "Merhaba! Ben FixIT Asistanı. Şifre, VPN, donanım veya erişim konularında size yardımcı olabilirim.";
        
        // Teşekkür ediyorsa kibarca karşılık ver...
        } elseif (strpos($message, 'teşekkür') !== false) {
            $responseText = "Rica ederim, başka yardımcı olabileceğim bir konu var mı?";
        
        // Yavaşlık kelimesi geçiyorsa...
        } elseif (strpos($message, 'yavaş') !== false) {
            $responseText = "Bilgisayarınız veya bir uygulama yavaş çalışıyorsa, öncelikle cihazı yeniden başlatmayı deneyin. Sorun sürüyorsa Görev Yöneticisi'nden CPU kullanımını kontrol edin.";
        }
        
        // Bota insansı bir hava katmak için anında cevap vermek yerine yarım saniye (500ms) bekletiyoruz
        usleep(500000);
        
        // Cevabı Frontend'e JSON olarak gönderiyoruz
        echo json_encode(['success' => true, 'response' => $responseText]);
    }
}
