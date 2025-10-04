<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// Connect to DB
$conn = new mysqli("localhost", "root", "", "dbuser");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

$email = $_GET['email'] ?? ''; // from URL ?email=emylia@gmail.com

if (empty($email)) {
    echo json_encode([]);
    exit();
}

// Query: fetch bookings linked to this email
$sql = "SELECT tbBook.pickup, tbBook.destination, tbBook.date, tbBook.time, tbBook.specialNeeds, tbBook.recurring
        FROM tbBook
        INNER JOIN tbUser ON tbBook.email = tbUser.email
        WHERE tbBook.email = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);

$stmt->close();
$conn->close();
?>
