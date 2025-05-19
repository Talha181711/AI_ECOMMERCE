<?php
include '../config/db.php'; // $conn is PDO instance
session_start();

// CORS Headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isset($_SESSION['admin_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

$admin_id = $_SESSION['admin_id'];

$sql = "SELECT id, order_id, message, read_status, created_at 
        FROM admin_notifications 
        WHERE admin_id = :admin_id 
        ORDER BY created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bindValue(':admin_id', $admin_id, PDO::PARAM_INT); // ✅ Proper PDO binding
$stmt->execute();

$notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(["status" => "success", "notifications" => $notifications]);
?>
