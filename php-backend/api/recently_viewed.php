<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Include PDO DB connection
require_once '../config/db.php';

$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

try {
    $query = "
        SELECT p.*
        FROM products p
        JOIN product_views v ON p.id = v.product_id
        WHERE v.user_id = :user_id
        ORDER BY v.viewed_at DESC
        LIMIT 10
    ";

    $stmt = $conn->prepare($query);
    $stmt->execute([':user_id' => $user_id]);

    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'products' => $products]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
