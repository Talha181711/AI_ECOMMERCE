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

// Include DB connection
require_once '../config/db.php'; // $pdo from db.php (PDO connection)

try {
    $query = "SELECT * FROM products ORDER BY RAND() LIMIT 10";
    $stmt = $conn->query($query);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'products' => $products]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
