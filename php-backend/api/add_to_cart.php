<?php
// add_to_cart.php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // CORS preflight
    exit;
}

include '../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);

$userId    = $input['user_id']    ?? null;
$productId = $input['product_id'] ?? null;
$variantId = $input['variant_id'] ?? null;
$quantity  = $input['quantity']   ?? 1;
$unitPrice = $input['unit_price'] ?? null;

$response = ['success' => false];

try {
    if (!$userId || !$productId || !$unitPrice) {
        throw new Exception("Missing required fields");
    }

    // 1) Check if this variant already in cart
    $stmt = $conn->prepare("
        SELECT id, quantity
        FROM cart_items
        WHERE user_id = ? AND variant_id = ?
    ");
    $stmt->execute([$userId, $variantId]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        // 2a) Update quantity
        $newQty = $existing['quantity'] + $quantity;
        $upd = $conn->prepare("
            UPDATE cart_items
            SET quantity = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $upd->execute([$newQty, $existing['id']]);
        $cartItemId = $existing['id'];
    } else {
        // 2b) Insert new row
        $ins = $conn->prepare("
            INSERT INTO cart_items
              (user_id, product_id, variant_id, quantity, unit_price, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        ");
        $ins->execute([$userId, $productId, $variantId, $quantity, $unitPrice]);
        $cartItemId = $conn->lastInsertId();
    }

    $response = [
        'success'      => true,
        'cart_item_id' => $cartItemId
    ];

} catch (PDOException $e) {
    http_response_code(500);
    $response['message'] = "Database error: " . $e->getMessage();
} catch (Exception $e) {
    http_response_code(400);
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
