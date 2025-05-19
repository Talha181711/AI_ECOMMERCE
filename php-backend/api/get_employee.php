<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");
header('Content-Type: application/json');

// Handle preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include '../config/db.php'; // $conn is PDO instance

try {
    $stmt = $conn->query("
        SELECT e.id, e.name, e.email, e.role_id, r.role_name
        FROM employees e
        JOIN employee_roles r ON e.role_id = r.id
    ");
    $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["employees" => $employees]);
} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to fetch employees",
        "error" => $e->getMessage()
    ]);
}
