<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

require_once '../config/db.php';

try {
    $stmt = $conn->query("SELECT id, role_name FROM employee_roles");
    $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["status" => "success", "roles" => $roles]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Failed to fetch roles", "error" => $e->getMessage()]);
}
