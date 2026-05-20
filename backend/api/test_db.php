<?php
try { 
    $pdo = new PDO('mysql:host=localhost;dbname=fixitdb;charset=utf8mb4', 'root', ''); 
    echo 'Basarili'; 
} catch (PDOException $e) { 
    echo 'Error: ' . $e->getMessage(); 
}
