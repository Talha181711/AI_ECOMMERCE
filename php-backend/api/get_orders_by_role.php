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

if (!isset($_SESSION['employee_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$employee_id = $_SESSION['employee_id'];
$role = $_GET['role'] ?? '';

try {
    if ($role === 'warehouse') {
        // ✅ Warehouse sees ALL Pending and Packed orders (no assignment logic)
        $stmt = $conn->prepare("
            SELECT o.*, os.status_name
            FROM orders o
            JOIN order_status os ON o.order_status_id = os.id
            WHERE o.order_status_id IN (1, 2)
            ORDER BY o.created_at DESC
        ");
        $stmt->execute();

    } elseif ($role === 'delivery') {
        // ✅ Delivery employee sees only assigned Packed or Shipped orders
        $stmt = $conn->prepare("
            SELECT o.*, os.status_name
            FROM orders o
            JOIN order_status os ON o.order_status_id = os.id
            JOIN order_assignments oa ON oa.order_id = o.id
            WHERE o.order_status_id = 3 AND oa.employee_id = ?
            ORDER BY o.created_at DESC
        ");
        $stmt->execute([$employee_id]);

    } else {
        echo json_encode(["status" => "error", "message" => "Invalid role"]);
        exit;
    }

    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["status" => "success", "orders" => $orders]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
