<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

require_once '../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['category_name']) || empty($data['category_name'])) {
    echo json_encode(['status' => 'error', 'message' => 'Category name is required']);
    exit;
}

$category_name = $data['category_name'];

$stmt = $conn->prepare("INSERT INTO categories (category_name) VALUES (?)");
if ($stmt->execute([$category_name])) {
    echo json_encode(['status' => 'success', 'message' => 'Category added successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to add category']);
}
?>
