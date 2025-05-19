<?php
session_start();
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

$data = json_decode(file_get_contents("php://input"));
$email = $data->email ?? '';
$password = $data->password ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Email and password are required"]);
    exit;
}

// ✅ Fetch employee and their role name using JOIN
$stmt = $conn->prepare("
    SELECT e.*, r.role_name 
    FROM employees e
    JOIN employee_roles r ON e.role_id = r.id
    WHERE e.email = ?
");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password'])) {
    // ✅ Set session variables
    $_SESSION['employee_id'] = $user['id'];
    $_SESSION['role'] = $user['role_name']; // Now using actual role name like 'warehouse' or 'delivery'

    error_log("Employee login successful. ID: {$_SESSION['employee_id']}, Role: {$_SESSION['role']}");

    echo json_encode([
        "status" => "success",
        "employee" => [
            "id" => $user['id'],
            "name" => $user['name'],
            "role" => $user['role_name']
        ]
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
}
