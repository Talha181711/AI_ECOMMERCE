<?php
// add_brand.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

require_once '../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['brand_name']) || empty($data['brand_name'])) {
    echo json_encode(['status' => 'error', 'message' => 'Brand name is required']);
    exit;
}

$brand_name = $data['brand_name'];

$stmt = $conn->prepare("INSERT INTO brands (brand_name) VALUES (?)");
if ($stmt->execute([$brand_name])) {
    echo json_encode(['status' => 'success', 'message' => 'Brand added successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to add brand']);
}
?>
