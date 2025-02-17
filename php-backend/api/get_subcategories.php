<?php
// get_subcategories.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

require_once '../config/db.php';

$categoryId = isset($_GET['category_id']) ? $_GET['category_id'] : null;

try {
    if ($categoryId) {
        // Return subcategories for a specific category
        $stmt = $conn->prepare("SELECT s.id, s.subcategory_name, c.category_name 
                                FROM subcategories s 
                                JOIN categories c ON s.category_id = c.id 
                                WHERE s.category_id = ?");
        $stmt->execute([$categoryId]);
    } else {
        // Return all subcategories
        $stmt = $conn->prepare("SELECT s.id, s.subcategory_name, c.category_name 
                                FROM subcategories s 
                                JOIN categories c ON s.category_id = c.id");
        $stmt->execute();
    }
    $subcategories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'subcategories' => $subcategories]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch subcategories']);
}
?>
