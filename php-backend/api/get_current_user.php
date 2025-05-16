<?php 

session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
if (!empty($_SESSION['user'])) {
  echo json_encode(['success' => true, 'user' => $_SESSION['user']]);
} else {
  echo json_encode(['success' => false]);
}

?>