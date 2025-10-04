<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight (OPTIONS) request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON input"]);
    exit;
}

// Collect data from frontend
$needs = $input['needs'] ?? '';

if (empty($needs)) {
    echo json_encode(["status" => "error", "message" => "No accessibility needs provided"]);
    exit;
}

// Connect to DB
$conn = new mysqli("localhost", "root", "", "dbuser");
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

// Insert new accessibility record
$stmt = $conn->prepare("INSERT INTO tbaccessibilities (needs) VALUES (?)");
$stmt->bind_param("s", $needs);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Accessibility needs saved successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to save needs"]);
}

$stmt->close();
$conn->close();
?>
