<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

include '../config/db.php';

$response = ['success' => false, 'message' => ''];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method");
    }

    // Validate required fields
    $required = ['title', 'description', 'price', 'category_id', 'subcategory_id', 'brand_id', 'variants'];
    foreach ($required as $field) {
        if (empty($_POST[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    $product = [
        'title' => $_POST['title'],
        'description' => $_POST['description'],
        'price' => (float)$_POST['price'],
        'category_id' => (int)$_POST['category_id'],
        'subcategory_id' => (int)$_POST['subcategory_id'],
        'brand_id' => (int)$_POST['brand_id']
    ];

    // Decode variants JSON properly
    $variants = json_decode($_POST['variants'], true);
    if (!is_array($variants)) {
        throw new Exception("Invalid variants format");
    }

    // Start transaction
    $conn->beginTransaction();

    // Insert product
    $stmt = $conn->prepare("INSERT INTO products (title, description, price, category_id, subcategory_id, brand_id) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $product['title'],
        $product['description'],
        $product['price'],
        $product['category_id'],
        $product['subcategory_id'],
        $product['brand_id']
    ]);
    $product_id = $conn->lastInsertId();

    // Insert variants and map images correctly
    $variantStmt = $conn->prepare("INSERT INTO product_variants (product_id, color_id, size_id, stock) VALUES (?, ?, ?, ?)");
    $imageStmt = $conn->prepare("INSERT INTO product_images (product_id, color_id, image_url) VALUES (?, ?, ?)");

    // Process images
    if (!empty($_FILES['images']['name'])) {
        $uploadDir = "../uploads/";
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        foreach ($_FILES['images']['name'] as $index => $fileName) {
            if ($_FILES['images']['error'][$index] === UPLOAD_ERR_OK) {
                $tmpName = $_FILES['images']['tmp_name'][$index];
                $filename = uniqid() . '_' . basename($fileName);
                $targetPath = $uploadDir . $filename;

                if (move_uploaded_file($tmpName, $targetPath)) {
                    $colorId = $_POST['image_color_ids'][$index];
                    $imageStmt->execute([
                        $product_id,
                        $colorId,
                        $filename
                    ]);
                }
            }
        }
    }

    foreach ($variants as $variant) {
        $variantStmt->execute([
            $product_id,
            $variant['color_id'],
            $variant['size_id'],
            $variant['stock']
        ]);
    }

    $conn->commit();
    $response = ['success' => true, 'message' => 'Product added successfully'];
} catch (Exception $e) {
    $conn->rollBack();
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>
