<?php
// get_cart_items.php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

include '../config/db.php';

$userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
$response = ['success' => false, 'items' => []];

try {
    if (!$userId) throw new Exception("Missing user_id");

    $stmt = $conn->prepare("
    SELECT 
  ci.id,
  ci.quantity,
  ci.unit_price,
  p.id AS product_id,
  p.title AS product_title,
  pi.image_url,
  v.id AS variant_id, -- ✅ Added this line
  v.size_id,
  s.size AS size_name,
  cl.color_name
FROM cart_items ci
JOIN products p ON p.id = ci.product_id
LEFT JOIN product_variants v ON v.id = ci.variant_id
LEFT JOIN sizes s ON s.id = v.size_id
LEFT JOIN colors cl ON cl.id = v.color_id
LEFT JOIN product_images pi
  ON pi.product_id = ci.product_id AND pi.color_id = v.color_id
WHERE ci.user_id = ?
ORDER BY ci.updated_at DESC

");


    $stmt->execute([$userId]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $response = [
      'success' => true,
      'items'   => $items
    ];

} catch (PDOException $e) {
    http_response_code(500);
    $response['message'] = "Database error: " . $e->getMessage();
} catch (Exception $e) {
    http_response_code(400);
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
