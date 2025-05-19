<?php
session_start();
require_once '../config/db.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if (!isset($_SESSION['employee_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$employee_id = $_SESSION['employee_id'];

$stmt = $conn->prepare("
    SELECT COUNT(*) AS count 
    FROM notifications 
    WHERE employee_id = ? 
    AND is_read = 0
");
$stmt->execute([$employee_id]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    "status" => "success",
    "count" => $row['count'] ?? 0
]);
?>
