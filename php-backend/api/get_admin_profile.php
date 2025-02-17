<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
session_start();

require_once '../config/db.php';

if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    exit;
}

$admin_id = $_SESSION['admin_id'];
$stmt = $conn->prepare("SELECT id, username, email FROM admins WHERE id = ?");
$stmt->execute([$admin_id]);
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

if ($admin) {
    echo json_encode(['status' => 'success', 'admin' => $admin]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Admin not found']);
}
?>
