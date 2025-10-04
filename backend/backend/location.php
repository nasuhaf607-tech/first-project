<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = new mysqli("localhost", "root", "", "dbuser");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

// Ensure table exists (simple auto-migrate)
$conn->query("CREATE TABLE IF NOT EXISTS tblocation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ride_id VARCHAR(64) NOT NULL,
    driver_id VARCHAR(64) NOT NULL,
    lat DOUBLE NOT NULL,
    lng DOUBLE NOT NULL,
    speed DOUBLE DEFAULT NULL,
    heading DOUBLE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (ride_id),
    INDEX (driver_id),
    INDEX (created_at)
) ENGINE=InnoDB");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!$input) {
        echo json_encode(["success" => false, "message" => "Invalid JSON input"]);
        exit();
    }

    $rideId = $input['ride_id'] ?? '';
    $driverId = $input['driver_id'] ?? '';
    $lat = isset($input['lat']) ? floatval($input['lat']) : null;
    $lng = isset($input['lng']) ? floatval($input['lng']) : null;
    $speed = isset($input['speed']) ? floatval($input['speed']) : null;
    $heading = isset($input['heading']) ? floatval($input['heading']) : null;

    if (empty($rideId) || empty($driverId) || $lat === null || $lng === null) {
        echo json_encode(["success" => false, "message" => "Missing fields"]);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO tblocation (ride_id, driver_id, lat, lng, speed, heading) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssdddd", $rideId, $driverId, $lat, $lng, $speed, $heading);
    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => $stmt->error]);
    }
    $stmt->close();
    $conn->close();
    exit();
}

// GET latest location for a given ride_id
if ($method === 'GET') {
    $rideId = $_GET['ride_id'] ?? '';
    if (empty($rideId)) {
        echo json_encode(["success" => false, "message" => "ride_id is required"]);
        exit();
    }
    $stmt = $conn->prepare("SELECT ride_id, driver_id, lat, lng, speed, heading, created_at
                             FROM tblocation WHERE ride_id = ?
                             ORDER BY created_at DESC LIMIT 1");
    $stmt->bind_param("s", $rideId);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();
    if ($row) {
        echo json_encode(["success" => true, "data" => $row]);
    } else {
        echo json_encode(["success" => false, "message" => "No data"]);
    }
    $stmt->close();
    $conn->close();
    exit();
}

echo json_encode(["success" => false, "message" => "Unsupported method"]);
?>



