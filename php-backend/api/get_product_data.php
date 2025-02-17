<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

require_once '../config/db.php';
// Fetch categories
$categories = $conn->query("SELECT id, category_name FROM categories")->fetchAll(PDO::FETCH_ASSOC);

// Fetch subcategories
$subcategories = $conn->query("SELECT id, subcategory_name, category_id FROM subcategories")->fetchAll(PDO::FETCH_ASSOC);

// Fetch brands
$brands = $conn->query("SELECT id, brand_name FROM brands")->fetchAll(PDO::FETCH_ASSOC);

// Fetch sizes
$sizes = $conn->query("SELECT id, size FROM sizes")->fetchAll(PDO::FETCH_ASSOC);

// Fetch colors
$colors = $conn->query("SELECT id, color_name FROM colors")->fetchAll(PDO::FETCH_ASSOC);

// Combine all data into a single response
$response = [
    'categories' => $categories,
    'subcategories' => $subcategories,
    'brands' => $brands,
    'sizes' => $sizes,
    'colors' => $colors
];

header('Content-Type: application/json');
echo json_encode($response);
?>
