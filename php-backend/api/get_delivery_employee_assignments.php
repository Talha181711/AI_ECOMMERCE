<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Include DB connection
include '../config/db.php';

try {
    // 1. Get delivery employees with assigned orders count
    $employeeStmt = $conn->prepare("
        SELECT 
            e.id AS employee_id, 
            e.name, 
            r.role_name, 
            COUNT(oa.order_id) AS assigned_orders
        FROM employees e
        INNER JOIN employee_roles r ON e.role_id = r.id
        LEFT JOIN order_assignments oa ON oa.employee_id = e.id
        WHERE r.role_name = 'delivery'
        GROUP BY e.id, e.name, r.role_name
    ");
    $employeeStmt->execute();
    $assignments = $employeeStmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Get unassigned orders (not present in order_assignments)
    $orderStmt = $conn->prepare("
        SELECT o.id, os.status_name AS order_status
        FROM orders o
        LEFT JOIN order_assignments oa ON o.id = oa.order_id
        INNER JOIN order_status os ON o.order_status_id = os.id
        WHERE oa.order_id IS NULL
    ");
    $orderStmt->execute();
    $unassigned_orders = $orderStmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Return JSON response
    echo json_encode([
        "status" => "success",
        "assignments" => $assignments,
        "unassigned_orders" => $unassigned_orders
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
}
