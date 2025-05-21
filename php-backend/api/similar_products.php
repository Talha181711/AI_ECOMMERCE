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

$product_id = isset($_GET['product_id']) ? (int)$_GET['product_id'] : 0;

try {
    // Step 1: Get category_id and brand_id of the given product
    $meta_query = "SELECT category_id, brand_id FROM products WHERE id = ?";
    $stmt = $conn->prepare($meta_query);
    $stmt->execute([$product_id]);
    $meta_result = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$meta_result) {
        echo json_encode(['success' => false, 'message' => 'Product not found']);
        exit;
    }

    $category_id = $meta_result['category_id'];
    $brand_id = $meta_result['brand_id'];

    // Step 2: Get similar products by category or brand, excluding current product
    $query = "
        SELECT * FROM products
        WHERE (category_id = :category_id OR brand_id = :brand_id)
          AND id != :product_id
        LIMIT 10
    ";
    $stmt = $conn->prepare($query);
    $stmt->execute([
        ':category_id' => $category_id,
        ':brand_id' => $brand_id,
        ':product_id' => $product_id
    ]);

    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'products' => $products]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
