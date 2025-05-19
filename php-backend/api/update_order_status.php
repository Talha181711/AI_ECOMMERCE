<?php

// update_order_status.php
session_start();
include '../config/db.php';

if (!isset($_SESSION['employee'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$employee = $_SESSION['employee'];
$data = json_decode(file_get_contents("php://input"), true);

$orderId = $data['order_id'];
$newStatusId = $data['new_status_id'];

try {
    // Get current order status
    $stmt = $conn->prepare("SELECT order_status_id FROM orders WHERE id = ?");
    $stmt->execute([$orderId]);
    $current = $stmt->fetch(PDO::FETCH_ASSOC)['order_status_id'];

    // Role-based permissions
    $allowed = false;
    if ($employee['role'] === 'warehouse' && in_array([$current, $newStatusId], [[1, 2], [2, 3]])) {
        $allowed = true;
    } elseif ($employee['role'] === 'delivery' && $current == 3 && $newStatusId == 4) {
        $allowed = true;
    }

    if (!$allowed) {
        echo json_encode(['status' => 'error', 'message' => 'Permission denied']);
        exit;
    }

    $update = $conn->prepare("UPDATE orders SET order_status_id = ? WHERE id = ?");
    $update->execute([$newStatusId, $orderId]);

    echo json_encode(['status' => 'success', 'message' => 'Order status updated']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'DB error: ' . $e->getMessage()]);
}

?>