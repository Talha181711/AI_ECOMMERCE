<?php
// delete_brand.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

require_once '../config/db.php';

if (!isset($_GET['id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Brand ID is required']);
    exit;
}

$brandId = $_GET['id'];

try {
    $stmt = $conn->prepare("DELETE FROM brands WHERE id = ?");
    if ($stmt->execute([$brandId])) {
        echo json_encode(['status' => 'success', 'message' => 'Brand deleted successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete brand']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to delete brand']);
}
?>
