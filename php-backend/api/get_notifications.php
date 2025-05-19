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

include '../config/db.php';

// ✅ Just check session login
$employee_id = $_SESSION['employee_id'] ?? null;
$role = $_SESSION['role'] ?? null;

if (!$employee_id || !in_array($role, ['warehouse', 'delivery'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized - invalid or missing session data"
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT * FROM notifications WHERE employee_id = ? ORDER BY created_at DESC");
    $stmt->execute([$employee_id]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "employee_id" => $employee_id,
        "role" => $role,
        "notifications" => $notifications
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>