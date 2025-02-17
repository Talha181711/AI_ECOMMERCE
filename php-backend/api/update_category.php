<?php
// update_category.php
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

if (!isset($data['id']) || !isset($data['category_name']) || empty($data['category_name'])) {
    echo json_encode(['status' => 'error', 'message' => 'Category ID and new name are required']);
    exit;
}

$id = $data['id'];
$category_name = $data['category_name'];

$stmt = $conn->prepare("UPDATE categories SET category_name = ? WHERE id = ?");
if ($stmt->execute([$category_name, $id])) {
    echo json_encode(['status' => 'success', 'message' => 'Category updated successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to update category']);
}
?>
