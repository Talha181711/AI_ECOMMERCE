<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

include '../config/db.php';

$response = ['success' => false, 'message' => ''];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        throw new Exception("Invalid request method");
    }

    // Get product ID from query params
    $productId = $_GET['id'] ?? null;
    if (!$productId || !is_numeric($productId)) {
        throw new Exception("Invalid product ID");
    }

    $conn->beginTransaction();

    // Delete images first
    $imageStmt = $conn->prepare("DELETE FROM product_images WHERE product_id = ?");
    $imageStmt->execute([$productId]);

    // Delete variants
    $variantStmt = $conn->prepare("DELETE FROM product_variants WHERE product_id = ?");
    $variantStmt->execute([$productId]);

    // Delete product
    $productStmt = $conn->prepare("DELETE FROM products WHERE id = ?");
    $productStmt->execute([$productId]);

    $conn->commit();
    $response = ['success' => true, 'message' => 'Product deleted successfully'];
} catch (Exception $e) {
    $conn->rollBack();
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>