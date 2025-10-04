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

// Auto-migrate: add columns if not exist
$conn->query("ALTER TABLE tbbook ADD COLUMN IF NOT EXISTS driver_id VARCHAR(64) DEFAULT NULL");
$conn->query("ALTER TABLE tbbook ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'pending'");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    if ($action === 'my') {
        $driverId = $_GET['driver_id'] ?? '';
        if (empty($driverId)) { echo json_encode(["success"=>false,"message"=>"driver_id required"]); exit(); }
        $stmt = $conn->prepare("SELECT pickup, destination, date, time, specialNeeds, recurring, email, ride_id, status FROM tbbook WHERE driver_id = ? ORDER BY date ASC, time ASC");
        $stmt->bind_param("s", $driverId);
        $stmt->execute();
        $result = $stmt->get_result();
        $rows = [];
        while ($row = $result->fetch_assoc()) { $rows[] = $row; }
        echo json_encode(["success" => true, "data" => $rows]);
        $stmt->close();
        $conn->close();
        exit();
    }
    if ($action === 'unassigned') {
        $res = $conn->query("SELECT pickup, destination, date, time, specialNeeds, recurring, email, ride_id FROM tbbook WHERE driver_id IS NULL OR driver_id = '' ORDER BY date ASC, time ASC");
        $rows = [];
        if ($res) { while ($row = $res->fetch_assoc()) { $rows[] = $row; } }
        echo json_encode(["success" => true, "data" => $rows]);
        $conn->close();
        exit();
    }
    echo json_encode(["success" => false, "message" => "Unknown action"]);
    $conn->close();
    exit();
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!$input) { echo json_encode(["success"=>false,"message"=>"Invalid JSON"]); exit(); }
    $action = $input['action'] ?? '';
    if ($action === 'assign') {
        $rideId = $input['ride_id'] ?? '';
        $driverId = $input['driver_id'] ?? '';
        if (empty($rideId) || empty($driverId)) { echo json_encode(["success"=>false,"message"=>"ride_id and driver_id required"]); exit(); }
        $stmt = $conn->prepare("UPDATE tbbook SET driver_id = ?, status = 'assigned' WHERE ride_id = ?");
        $stmt->bind_param("ss", $driverId, $rideId);
        $ok = $stmt->execute();
        if ($ok && $stmt->affected_rows >= 1) {
            echo json_encode(["success"=>true]);
        } else {
            echo json_encode(["success"=>false, "message"=>"Assign failed or already assigned"]);
        }
        $stmt->close();
        $conn->close();
        exit();
    }
    if ($action === 'decline') {
        $rideId = $input['ride_id'] ?? '';
        if (empty($rideId)) { echo json_encode(["success"=>false,"message"=>"ride_id required"]); exit(); }
        $stmt = $conn->prepare("UPDATE tbbook SET driver_id = NULL, status = 'pending' WHERE ride_id = ?");
        $stmt->bind_param("s", $rideId);
        $ok = $stmt->execute();
        if ($ok && $stmt->affected_rows >= 1) {
            echo json_encode(["success"=>true]);
        } else {
            echo json_encode(["success"=>false, "message"=>"Decline failed"]);
        }
        $stmt->close();
        $conn->close();
        exit();
    }
    echo json_encode(["success" => false, "message" => "Unknown action"]);
    $conn->close();
    exit();
}

echo json_encode(["success" => false, "message" => "Unsupported method"]);
?>


