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
include '../config/db.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->user_id) || !isset($data->product_id)) {
    echo json_encode(["success" => false, "message" => "Missing fields"]);
    exit;
}

$user_id = intval($data->user_id);
$product_id = intval($data->product_id);

// Optional: Prevent duplicate entries
$stmt = $conn->prepare("SELECT id FROM product_views WHERE user_id = ? AND product_id = ?");
$stmt->execute([$user_id, $product_id]);
if ($stmt->rowCount() === 0) {
    $insert = $conn->prepare("INSERT INTO product_views (user_id, product_id, viewed_at) VALUES (?, ?, NOW())");
    $insert->execute([$user_id, $product_id]);
}

echo json_encode(["success" => true]);
?>
