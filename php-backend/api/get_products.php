<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

include '../config/db.php';

$response = ['success' => false, 'products' => []];

try {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;

    // Base query
    $productQuery = "
        SELECT 
            p.*,
            c.category_name,
            s.subcategory_name,
            b.brand_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN subcategories s ON p.subcategory_id = s.id
        LEFT JOIN brands b ON p.brand_id = b.id
    ";

    // Fetch specific product if ID is provided
    if ($id) {
        $productQuery .= " WHERE p.id = ?";
        $productStmt = $conn->prepare($productQuery);
        $productStmt->execute([$id]);
    } else {
        $productQuery .= " ORDER BY p.id DESC";
        $productStmt = $conn->query($productQuery);
    }

    $products = $productStmt->fetchAll(PDO::FETCH_ASSOC);

    if ($id && empty($products)) {
        throw new Exception("Product not found");
    }

    // Get variants and images for each product
    foreach ($products as &$product) {
        // Get variants
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
        $variantStmt->execute([$product['id']]);
        $product['variants'] = $variantStmt->fetchAll(PDO::FETCH_ASSOC);

        // Get images
        $imageStmt = $conn->prepare("
            SELECT * FROM product_images 
            WHERE product_id = ?
        ");
        $imageStmt->execute([$product['id']]);
        $product['images'] = $imageStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    $response = [
        'success' => true,
        'products' => $products
    ];

} catch (PDOException $e) {
    $response['message'] = "Database error: " . $e->getMessage();
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>
