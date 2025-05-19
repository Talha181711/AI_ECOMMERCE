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

// Check for session
if (!isset($_SESSION['admin_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

$admin_id = $_SESSION['admin_id'];

try {
    $sql = "UPDATE admin_notifications SET read_status = 1 WHERE admin_id = :admin_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindValue(':admin_id', $admin_id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Notifications marked as read"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to mark notifications as read"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Server error while updating notifications",
        "error" => $e->getMessage()
    ]);
}
?>
