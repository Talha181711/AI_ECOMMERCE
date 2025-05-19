<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');
// Handle preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    http_response_code(200); // Send OK for preflight
    exit();
}
require_once '../config/db.php'; // Should define $pdo (PDO instance)

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['name'], $data['email'], $data['password'], $data['role_id'])) {
    http_response_code(400); // Bad request
    echo json_encode(["status" => "error", "message" => "Invalid or missing input fields"]);
    exit;
}

$name = $data['name'];
$email = $data['email'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);
$role_id = $data['role_id'];

try {
    $stmt = $conn->prepare("INSERT INTO employees (name, email, password, role_id) VALUES (?, ?, ?, ?)");
    $success = $stmt->execute([$name, $email, $password, $role_id]);

    if ($success) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Insert failed"]);
    }
} catch (PDOException $e) {
    http_response_code(500); // Server error
    echo json_encode([
        "status" => "error",
        "message" => "Email might already exist",
        "error" => $e->getMessage()
    ]);
}
