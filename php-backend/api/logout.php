<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
session_start();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    session_unset();
    session_destroy();
    echo json_encode(["status" => "success", "message" => "Logged out successfully"]);
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid request"]);
exit;
?>
