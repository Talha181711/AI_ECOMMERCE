<?php
session_start();
require_once '../config/db.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");

if (!isset($_SESSION['employee_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$employee_id = $_SESSION['employee_id'];

$stmt = $conn->prepare("
    UPDATE notifications
    SET is_read = 1
    WHERE employee_id = ?
");
$stmt->execute([$employee_id]);

echo json_encode(["status" => "success", "message" => "Notifications marked as read"]);
?>
