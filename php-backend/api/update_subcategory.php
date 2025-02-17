<?php
// update_subcategory.php
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

if (!isset($data['id']) || !isset($data['subcategory_name']) || empty($data['subcategory_name'])) {
    echo json_encode(['status' => 'error', 'message' => 'Subcategory ID and new name are required']);
    exit;
}

$id = $data['id'];
$subcategory_name = $data['subcategory_name'];

$stmt = $conn->prepare("UPDATE subcategories SET subcategory_name = ? WHERE id = ?");
if ($stmt->execute([$subcategory_name, $id])) {
    echo json_encode(['status' => 'success', 'message' => 'Subcategory updated successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to update subcategory']);
}
?>
