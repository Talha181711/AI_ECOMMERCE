<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight (OPTIONS) request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit();
}

require_once '../config/db.php';

// Check if the ID parameter is set
if (!isset($_GET['id']) || empty($_GET['id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Category ID is required']);
    exit();
}

$categoryId = $_GET['id'];

try {
    // Prepare the DELETE query
    $stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->execute([$categoryId]);

    // Check if a row was actually deleted
    if ($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Category deleted successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Category not found or already deleted']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
