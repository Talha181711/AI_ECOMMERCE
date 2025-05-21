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

require_once '../config/db.php';

$response = ['success' => false, 'products' => []];

try {
    // Fetch top trending product IDs based on views in the last 7 days
    $stmt = $conn->prepare("
        SELECT 
            p.id,
            COUNT(v.id) AS recent_views
        FROM products p
        JOIN product_views v ON p.id = v.product_id
        WHERE v.viewed_at >= NOW() - INTERVAL 7 DAY
        GROUP BY p.id
        ORDER BY recent_views DESC
        LIMIT 10
    ");
    $stmt->execute();
    $trendingData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $productIds = array_column($trendingData, 'id');

    if (empty($productIds)) {
        echo json_encode(['success' => true, 'products' => []]);
        exit;
    }

    // Build placeholders (?, ?, ?) for IN clause
    $placeholders = implode(',', array_fill(0, count($productIds), '?'));

    // Fetch product details
    $productStmt = $conn->prepare("
        SELECT 
            p.*,
            c.category_name,
            s.subcategory_name,
            b.brand_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN subcategories s ON p.subcategory_id = s.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.id IN ($placeholders)
    ");
    $productStmt->execute($productIds);
    $products = $productStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($products as &$product) {
        $productId = $product['id'];

        // Add recent_views from trending data
        $viewData = array_filter($trendingData, fn($item) => $item['id'] == $productId);
        $product['recent_views'] = $viewData ? array_values($viewData)[0]['recent_views'] : 0;

        // Fetch variants
        $variantStmt = $conn->prepare("
            SELECT 
                pv.*, 
                cl.color_name, 
                sz.size
            FROM product_variants pv
            LEFT JOIN colors cl ON pv.color_id = cl.id
            LEFT JOIN sizes sz ON pv.size_id = sz.id
            WHERE pv.product_id = ?
        ");
        $variantStmt->execute([$productId]);
        $product['variants'] = $variantStmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch images
        $imageStmt = $conn->prepare("SELECT * FROM product_images WHERE product_id = ?");
        $imageStmt->execute([$productId]);
        $product['images'] = $imageStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    $response = [
        'success' => true,
        'products' => $products
    ];
} catch (PDOException $e) {
    $response['message'] = "Database error: " . $e->getMessage();
}

echo json_encode($response);
?>
