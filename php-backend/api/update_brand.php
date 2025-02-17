<?php
// update_brand.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Methods: PUT, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    exit(0);
}

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

require_once '../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !isset($data['brand_name']) || empty($data['brand_name'])) {
    echo json_encode(['status' => 'error', 'message' => 'Brand ID and new name are required']);
    exit;
}

$id = $data['id'];
$brand_name = $data['brand_name'];

$stmt = $conn->prepare("UPDATE brands SET brand_name = ? WHERE id = ?");
if ($stmt->execute([$brand_name, $id])) {
    echo json_encode(['status' => 'success', 'message' => 'Brand updated successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to update brand']);
}
?>
