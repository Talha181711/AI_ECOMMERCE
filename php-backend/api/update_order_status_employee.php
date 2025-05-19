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

$data = json_decode(file_get_contents("php://input"));
$order_id = $data->order_id ?? null;
$new_status_id = $data->status_id ?? null;

if (!isset($_SESSION['employee_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$employee_id = $_SESSION['employee_id'];

// Map of allowed status updates by role
$allowed_status_updates = [
    "warehouse" => [2, 3], // warehouse can update to Packed and Shipped
    "delivery" => [4]      // delivery can update to Delivered
];

// ✅ Get the employee's role name
$stmt = $conn->prepare("
    SELECT r.role_name AS role_name
    FROM employees e
    JOIN employee_roles r ON e.role_id = r.id
    WHERE e.id = ?
");
$stmt->execute([$employee_id]);
$employee = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$employee || empty($employee['role_name'])) {
    echo json_encode(["status" => "error", "message" => "Employee or role not found"]);
    exit;
}

$role = strtolower($employee['role_name']);

if (!array_key_exists($role, $allowed_status_updates)) {
    echo json_encode(["status" => "error", "message" => "Invalid role"]);
    exit;
}
if (!in_array($new_status_id, $allowed_status_updates[$role])) {
    echo json_encode(["status" => "error", "message" => "Permission denied for this status change"]);
    exit;
}

// ✅ Fetch the previous status
$stmt = $conn->prepare("SELECT order_status_id FROM orders WHERE id = ?");
$stmt->execute([$order_id]);
$order = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$order) {
    echo json_encode(["status" => "error", "message" => "Order not found"]);
    exit;
}

$previous_status_id = $order['order_status_id'];

// ✅ Update the order status
$stmt = $conn->prepare("UPDATE orders SET order_status_id = ?, updated_at = NOW() WHERE id = ?");
$success = $stmt->execute([$new_status_id, $order_id]);

if ($success) {
    // ✅ Log the status change
    $log_stmt = $conn->prepare("
        INSERT INTO order_status_logs (order_id, employee_id, previous_status_id, new_status_id)
        VALUES (?, ?, ?, ?)
    ");
    $log_stmt->execute([$order_id, $employee_id, $previous_status_id, $new_status_id]);

    // ✅ Fetch status name for message
    $status_stmt = $conn->prepare("SELECT status_name FROM order_status WHERE id = ?");
    $status_stmt->execute([$new_status_id]);
    $status_row = $status_stmt->fetch(PDO::FETCH_ASSOC);
    $status_name = $status_row ? $status_row['status_name'] : 'Unknown';

    // ✅ Notify All Admins (from admins table)
    $admin_stmt = $conn->prepare("SELECT id FROM admins");
    $admin_stmt->execute();
    $admins = $admin_stmt->fetchAll(PDO::FETCH_ASSOC);

    $admin_message = "Order #$order_id status updated to $status_name.";

    $notif_admin_stmt = $conn->prepare("
        INSERT INTO admin_notifications (admin_id, order_id, message, read_status, created_at)
        VALUES (?, ?, ?, 0, NOW())
    ");

    foreach ($admins as $admin) {
        $notif_admin_stmt->execute([$admin['id'], $order_id, $admin_message]);
    }

    // ✅ If status is 'Shipped' (3), notify assigned delivery employee
    if ($new_status_id == 3) {
        $assign_stmt = $conn->prepare("SELECT employee_id FROM order_assignments WHERE order_id = ?");
        $assign_stmt->execute([$order_id]);
        $assigned = $assign_stmt->fetch(PDO::FETCH_ASSOC);

        if ($assigned) {
            $notif_emp = $conn->prepare("
                INSERT INTO notifications (employee_id, order_id, message, is_read, created_at)
                VALUES (?, ?, ?, 0, NOW())
            ");
            $notif_emp->execute([
                $assigned['employee_id'],
                $order_id,
                "Order #$order_id is ready for delivery (Shipped)."
            ]);
        }
    }

    echo json_encode([
        "status" => "success",
        "message" => "Order status updated, logged, and notifications sent."
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to update status"
    ]);
}
?>
