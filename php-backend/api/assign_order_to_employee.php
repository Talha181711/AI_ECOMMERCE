<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$order_id = $data['order_id'] ?? null;
$employee_id = $data['employee_id'] ?? null;

if (!$order_id || !$employee_id) {
    echo json_encode(["status" => "error", "message" => "Invalid input"]);
    exit;
}

// Check if already assigned
$stmtCheck = $conn->prepare("SELECT * FROM order_assignments WHERE order_id = ?");
$stmtCheck->execute([$order_id]);

if ($stmtCheck->rowCount() > 0) {
    $stmt = $conn->prepare("UPDATE order_assignments SET employee_id = ? WHERE order_id = ?");
    $success = $stmt->execute([$employee_id, $order_id]);
} else {
    $stmt = $conn->prepare("INSERT INTO order_assignments (order_id, employee_id) VALUES (?, ?)");
    $success = $stmt->execute([$order_id, $employee_id]);
}

if ($success) {
    $message = "You have been assigned to Order #$order_id.";
    $notify = $conn->prepare("INSERT INTO notifications (employee_id, order_id, message, is_read) VALUES (?, ?, ?, 0)");
    $notify->execute([$employee_id, $order_id, $message]);

    echo json_encode(["status" => "success", "message" => "Order assigned and notification sent"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to assign order"]);
}

