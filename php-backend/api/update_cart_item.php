<?php
// update_cart_item.php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

include '../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);
$cartItemId = $input['cart_item_id'] ?? null;
$quantity   = $input['quantity']     ?? null;
$userId     = $input['user_id']      ?? null;

$response = ['success' => false];

try {
    if (!$cartItemId || !$userId || $quantity === null) {
        throw new Exception("Missing required fields");
    }

    $stmt = $conn->prepare("
      UPDATE cart_items
      SET quantity = ?, updated_at = NOW()
      WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$quantity, $cartItemId, $userId]);

    if ($stmt->rowCount() === 0) {
        throw new Exception("No matching cart item found");
    }

    $response['success'] = true;
} catch (PDOException $e) {
    http_response_code(500);
    $response['message'] = "Database error: " . $e->getMessage();
} catch (Exception $e) {
    http_response_code(400);
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
