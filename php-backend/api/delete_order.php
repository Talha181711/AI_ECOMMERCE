<?php
// delete_order.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

require_once '../config/db.php';

if (!isset($_GET['id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Order ID is required']);
    exit;
}

$orderId = $_GET['id'];

try {
    // First, delete related order items
    $stmtItems = $conn->prepare("DELETE FROM order_items WHERE order_id = ?");
    $stmtItems->execute([$orderId]);

    // Then, delete the order
    $stmtOrder = $conn->prepare("DELETE FROM orders WHERE id = ?");
    if ($stmtOrder->execute([$orderId])) {
        echo json_encode(['status' => 'success', 'message' => 'Order deleted successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete order']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to delete order']);
}
?>
