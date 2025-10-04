<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);

$pickup = $input['pickup'] ?? '';
$destination = $input['destination'] ?? '';
$date = $input['date'] ?? '';
$time = $input['time'] ?? '';
$specialNeeds = $input['specialNeeds'] ?? '';
$recurring = $input['recurring'] ?? '';
$email = $input['email'] ?? '';
// generate simple ride id server-side as well
$rideId = 'RIDE-' . time() . '-' . rand(1000,9999);

// Connect to DB
$conn = new mysqli("localhost", "root", "", "dbuser");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

// Ensure column ride_id exists (auto-migrate)
$colCheck = $conn->prepare("SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tbbook' AND COLUMN_NAME = 'ride_id'");
$dbName = $conn->real_escape_string('dbuser');
$colCheck->bind_param("s", $dbName);
$colCheck->execute();
$res = $colCheck->get_result();
$row = $res->fetch_assoc();
if (isset($row['cnt']) && intval($row['cnt']) === 0) {
    $conn->query("ALTER TABLE tbbook ADD COLUMN ride_id VARCHAR(64) DEFAULT NULL");
}
$colCheck->close();

// Check if booking slot already taken
$stmt = $conn->prepare("SELECT email FROM tbbook WHERE date = ? AND time = ?");
$stmt->bind_param("ss", $date, $time);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Duplicate found
    echo json_encode(["success" => false, "message" => "A booking already exists for this date and time."]);
} else {
    // No duplicate, proceed with insert
    $insert = $conn->prepare("INSERT INTO tbbook (pickup, destination, date, time, specialNeeds, recurring, email, ride_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $insert->bind_param("ssssssss", $pickup, $destination, $date, $time, $specialNeeds, $recurring, $email, $rideId);

    if ($insert->execute()) {
        echo json_encode(["success" => true, "message" => "Booking successful!", "ride_id" => $rideId]);
    } else {
        echo json_encode(["success" => false, "message" => "Booking failed: " . $insert->error]);
    }
}

$conn->close();
?>
