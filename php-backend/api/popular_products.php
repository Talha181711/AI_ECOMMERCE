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

// Include DB connection (PDO)
require_once '../config/db.php'; // Ensure this sets up $pdo

try {
    $query = "
        SELECT p.*, COUNT(r.id) as review_count, AVG(r.rating) as avg_rating
        FROM products p
        LEFT JOIN product_reviews r ON p.id = r.product_id
        GROUP BY p.id
        ORDER BY avg_rating DESC, review_count DESC
        LIMIT 4
    ";

    $stmt = $conn->prepare($query);
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'products' => $products]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
