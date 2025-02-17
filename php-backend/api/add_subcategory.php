<?php
// add_subcategory.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    exit(0);
}

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

require_once '../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['category_id']) || empty($data['category_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Category ID is required']);
    exit;
}

if (!isset($data['subcategory_name']) || empty($data['subcategory_name'])) {
    echo json_encode(['status' => 'error', 'message' => 'Subcategory name is required']);
    exit;
}

$category_id = $data['category_id'];
$subcategory_name = $data['subcategory_name'];

$stmt = $conn->prepare("INSERT INTO subcategories (category_id, subcategory_name) VALUES (?, ?)");
if ($stmt->execute([$category_id, $subcategory_name])) {
    echo json_encode(['status' => 'success', 'message' => 'Subcategory added successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to add subcategory']);
}
?>
