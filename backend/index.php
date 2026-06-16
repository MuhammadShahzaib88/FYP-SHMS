<?php
// backend/index.php

// Serve static files (like uploaded images) directly if they exist
$requestUri = $_SERVER['REQUEST_URI'];
$filePath = __DIR__ . parse_url($requestUri, PHP_URL_PATH);
if (is_file($filePath)) {
    return false;
}

// CORS Headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($requestUri, PHP_URL_PATH);

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function getJsonInput() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}

// ROUTING TREE

// Auth Services
if ($method === 'POST' && $path === '/api/auth/setup-admin') {
    $input = getJsonInput();
    $name = $input['name'] ?? '';
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    
    if (empty($name) || empty($email) || empty($password)) {
        jsonResponse(['message' => 'All fields are required'], 400);
    }
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    if ($stmt->fetchColumn() > 0) {
        jsonResponse(['message' => 'Admin user already exists'], 400);
    }
    
    $userId = generateId();
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $now = date('Y-m-d H:i:s');
    
    $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'admin', ?, ?)");
    $stmt->execute([$userId, $name, strtolower($email), $hashedPassword, $now, $now]);
    
    $token = generateJWT(['id' => $userId, 'role' => 'admin', 'email' => $email]);
    
    jsonResponse([
        '_id' => $userId,
        'name' => $name,
        'email' => $email,
        'role' => 'admin',
        'token' => $token
    ], 201);
}

if ($method === 'POST' && $path === '/api/auth/register') {
    $input = getJsonInput();
    $name = $input['name'] ?? '';
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    
    if (empty($name) || empty($email) || empty($password)) {
        jsonResponse(['message' => 'All fields are required'], 400);
    }
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([strtolower($email)]);
    if ($stmt->fetch()) {
        jsonResponse(['message' => 'User already exists'], 400);
    }
    
    $userId = generateId();
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $now = date('Y-m-d H:i:s');
    
    $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'student', ?, ?)");
    $stmt->execute([$userId, $name, strtolower($email), $hashedPassword, $now, $now]);
    
    $token = generateJWT(['id' => $userId, 'role' => 'student', 'email' => $email]);
    
    jsonResponse([
        '_id' => $userId,
        'name' => $name,
        'email' => $email,
        'role' => 'student',
        'token' => $token
    ], 201);
}

if ($method === 'POST' && $path === '/api/auth/login') {
    $input = getJsonInput();
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        jsonResponse(['message' => 'All fields are required'], 400);
    }
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([strtolower($email)]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['password'])) {
        jsonResponse(['message' => 'Invalid credentials'], 400);
    }
    
    $token = generateJWT(['id' => $user['id'], 'role' => $user['role'], 'email' => $user['email'], 'name' => $user['name']]);
    
    jsonResponse([
        '_id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'token' => $token
    ], 200);
}

if ($method === 'GET' && $path === '/api/auth/me') {
    $currentUser = requireAuth();
    $stmt = $pdo->prepare("SELECT id, name, email, role FROM users WHERE id = ?");
    $stmt->execute([$currentUser['id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        jsonResponse(['message' => 'User not found'], 404);
    }
    
    $user['_id'] = $user['id'];
    jsonResponse($user, 200);
}

// Student Application Services
if ($method === 'POST' && $path === '/api/apply') {
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $fatherName = $_POST['fatherName'] ?? '';
    $guardianEmail = $_POST['guardianEmail'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $cnic = $_POST['cnic'] ?? '';
    $address = $_POST['address'] ?? '';
    $department = $_POST['department'] ?? '';
    $semester = $_POST['semester'] ?? '';
    
    if (empty($name) || empty($email) || empty($password) || empty($fatherName) || empty($phone) || empty($cnic)) {
        jsonResponse(['message' => 'Please provide all required fields'], 400);
    }
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([strtolower($email)]);
    if ($stmt->fetch()) {
        jsonResponse(['message' => 'Email is already registered'], 400);
    }
    
    $stmt = $pdo->prepare("SELECT id FROM student_applications WHERE email = ? AND status = 'pending'");
    $stmt->execute([strtolower($email)]);
    if ($stmt->fetch()) {
        jsonResponse(['message' => 'You already have a pending application'], 400);
    }
    
    $photoPath = null;
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        $ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $fileName = generateId() . '.' . $ext;
        $targetFile = $uploadDir . $fileName;
        if (move_uploaded_file($_FILES['photo']['tmp_name'], $targetFile)) {
            $photoPath = '/uploads/' . $fileName;
        }
    }
    
    $appId = generateId();
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $now = date('Y-m-d H:i:s');
    
    $stmt = $pdo->prepare("INSERT INTO student_applications (id, name, email, password, fatherName, guardianEmail, phone, cnic, address, department, semester, status, roomId, photo, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, ?, ?, ?)");
    $stmt->execute([$appId, $name, strtolower($email), $hashedPassword, $fatherName, $guardianEmail, $phone, $cnic, $address, $department, $semester, $photoPath, $now, $now]);
    
    $adminsStmt = $pdo->query("SELECT id FROM users WHERE role = 'admin'");
    $admins = $adminsStmt->fetchAll();
    foreach ($admins as $admin) {
        $notifId = generateId();
        $notifStmt = $pdo->prepare("INSERT INTO notifications (id, recipientId, recipientType, title, message, type, relatedId, isRead, createdAt) VALUES (?, ?, 'admin', 'New Application', ?, 'application', ?, 0, ?)");
        $notifStmt->execute([$notifId, $admin['id'], "New application submitted by $name", $appId, $now]);
    }
    
    jsonResponse(['message' => 'Application submitted successfully', 'applicationId' => $appId], 201);
}

if ($method === 'GET' && $path === '/api/admin/applications') {
    requireRole(['admin']);
    
    $stmt = $pdo->query("SELECT * FROM student_applications ORDER BY createdAt DESC");
    $apps = $stmt->fetchAll();
    foreach ($apps as &$app) {
        $app['_id'] = $app['id'];
    }
    jsonResponse($apps, 200);
}

if ($method === 'PUT' && preg_match('~^/api/admin/approve/([a-f0-9]{24})$~', $path, $matches)) {
    requireRole(['admin']);
    $appId = $matches[1];
    $input = getJsonInput();
    $roomId = $input['roomId'] ?? '';
    
    if (empty($roomId)) {
        jsonResponse(['message' => 'Room ID is required to approve application'], 400);
    }
    
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("SELECT * FROM student_applications WHERE id = ?");
        $stmt->execute([$appId]);
        $app = $stmt->fetch();
        
        if (!$app) {
            $pdo->rollBack();
            jsonResponse(['message' => 'Application not found'], 404);
        }
        
        if ($app['status'] !== 'pending') {
            $pdo->rollBack();
            jsonResponse(['message' => 'Application is already processed'], 400);
        }
        
        $stmt = $pdo->prepare("SELECT * FROM rooms WHERE id = ?");
        $stmt->execute([$roomId]);
        $room = $stmt->fetch();
        
        if (!$room) {
            $pdo->rollBack();
            jsonResponse(['message' => 'Room not found'], 404);
        }
        
        if ($room['occupiedBeds'] >= $room['capacity']) {
            $pdo->rollBack();
            jsonResponse(['message' => 'Selected room is already full'], 400);
        }
        
        $studentUserId = generateId();
        $now = date('Y-m-d H:i:s');
        
        $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'student', ?, ?)");
        $stmt->execute([$studentUserId, $app['name'], $app['email'], $app['password'], $now, $now]);
        
        $stmt = $pdo->prepare("UPDATE student_applications SET status = 'approved', roomId = ?, studentId = ?, updatedAt = ? WHERE id = ?");
        $stmt->execute([$roomId, $studentUserId, $now, $appId]);
        
        $stmt = $pdo->prepare("UPDATE rooms SET occupiedBeds = occupiedBeds + 1, updatedAt = ? WHERE id = ?");
        $stmt->execute([$now, $roomId]);
        
        $notifId = generateId();
        $stmt = $pdo->prepare("INSERT INTO notifications (id, recipientId, recipientType, title, message, type, relatedId, isRead, createdAt) VALUES (?, ?, 'student', 'Application Approved', ?, 'approval', ?, 0, ?)");
        $stmt->execute([$notifId, $studentUserId, "Congratulations! Your hostel application has been approved. Room " . $room['roomNumber'] . " has been assigned.", $appId, $now]);
        
        $pdo->commit();
        jsonResponse(['message' => 'Application approved and student registered successfully'], 200);
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(['message' => 'Approval failed: ' . $e->getMessage()], 500);
    }
}

if ($method === 'PUT' && preg_match('~^/api/admin/reject/([a-f0-9]{24})$~', $path, $matches)) {
    requireRole(['admin']);
    $appId = $matches[1];
    $now = date('Y-m-d H:i:s');
    
    $stmt = $pdo->prepare("SELECT * FROM student_applications WHERE id = ?");
    $stmt->execute([$appId]);
    $app = $stmt->fetch();
    
    if (!$app) {
        jsonResponse(['message' => 'Application not found'], 404);
    }
    
    if ($app['status'] !== 'pending') {
        jsonResponse(['message' => 'Application already processed'], 400);
    }
    
    $stmt = $pdo->prepare("UPDATE student_applications SET status = 'rejected', updatedAt = ? WHERE id = ?");
    $stmt->execute([$now, $appId]);
    
    jsonResponse(['message' => 'Application rejected successfully'], 200);
}

if ($method === 'GET' && $path === '/api/admin/approved-students') {
    requireRole(['admin']);
    
    $stmt = $pdo->query("SELECT a.*, r.roomNumber, r.floor, r.hostelBlock FROM student_applications a LEFT JOIN rooms r ON a.roomId = r.id WHERE a.status = 'approved' ORDER BY a.updatedAt DESC");
    $students = $stmt->fetchAll();
    
    foreach ($students as &$student) {
        $student['_id'] = $student['id'];
        if ($student['roomId']) {
            $student['room'] = [
                '_id' => $student['roomId'],
                'roomNumber' => $student['roomNumber'],
                'floor' => $student['floor'],
                'hostelBlock' => $student['hostelBlock']
            ];
        } else {
            $student['room'] = null;
        }
    }
    jsonResponse($students, 200);
}

// Room Services
if ($method === 'POST' && $path === '/api/admin/rooms') {
    requireRole(['admin']);
    $input = getJsonInput();
    $roomNumber = $input['roomNumber'] ?? '';
    $floor = $input['floor'] ?? '';
    $capacity = isset($input['capacity']) ? intval($input['capacity']) : 4;
    $hostelBlock = $input['hostelBlock'] ?? 'A';
    
    if (empty($roomNumber) || empty($floor)) {
        jsonResponse(['message' => 'Room number and floor are required'], 400);
    }
    
    $stmt = $pdo->prepare("SELECT id FROM rooms WHERE roomNumber = ?");
    $stmt->execute([$roomNumber]);
    if ($stmt->fetch()) {
        jsonResponse(['message' => 'Room number already exists'], 400);
    }
    
    $roomId = generateId();
    $now = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare("INSERT INTO rooms (id, roomNumber, floor, capacity, occupiedBeds, hostelBlock, createdAt, updatedAt) VALUES (?, ?, ?, ?, 0, ?, ?, ?)");
    $stmt->execute([$roomId, $roomNumber, $floor, $capacity, $hostelBlock, $now, $now]);
    
    jsonResponse([
        '_id' => $roomId,
        'roomNumber' => $roomNumber,
        'floor' => $floor,
        'capacity' => $capacity,
        'occupiedBeds' => 0,
        'hostelBlock' => $hostelBlock
    ], 201);
}

if ($method === 'GET' && $path === '/api/rooms') {
    $stmt = $pdo->query("SELECT * FROM rooms ORDER BY roomNumber ASC");
    $rooms = $stmt->fetchAll();
    foreach ($rooms as &$room) {
        $room['_id'] = $room['id'];
    }
    jsonResponse($rooms, 200);
}

if ($method === 'GET' && $path === '/api/rooms/available') {
    $stmt = $pdo->query("SELECT * FROM rooms WHERE occupiedBeds < capacity ORDER BY roomNumber ASC");
    $rooms = $stmt->fetchAll();
    foreach ($rooms as &$room) {
        $room['_id'] = $room['id'];
    }
    jsonResponse($rooms, 200);
}

if ($method === 'GET' && preg_match('~^/api/rooms/([a-f0-9]{24})$~', $path, $matches)) {
    $roomId = $matches[1];
    $stmt = $pdo->prepare("SELECT * FROM rooms WHERE id = ?");
    $stmt->execute([$roomId]);
    $room = $stmt->fetch();
    
    if (!$room) {
        jsonResponse(['message' => 'Room not found'], 404);
    }
    
    $room['_id'] = $room['id'];
    jsonResponse($room, 200);
}

if ($method === 'PUT' && preg_match('~^/api/admin/rooms/([a-f0-9]{24})$~', $path, $matches)) {
    requireRole(['admin']);
    $roomId = $matches[1];
    $input = getJsonInput();
    
    $stmt = $pdo->prepare("SELECT * FROM rooms WHERE id = ?");
    $stmt->execute([$roomId]);
    $room = $stmt->fetch();
    
    if (!$room) {
        jsonResponse(['message' => 'Room not found'], 404);
    }
    
    $roomNumber = $input['roomNumber'] ?? $room['roomNumber'];
    $floor = $input['floor'] ?? $room['floor'];
    $capacity = isset($input['capacity']) ? intval($input['capacity']) : $room['capacity'];
    $hostelBlock = $input['hostelBlock'] ?? $room['hostelBlock'];
    
    if ($roomNumber !== $room['roomNumber']) {
        $uStmt = $pdo->prepare("SELECT id FROM rooms WHERE roomNumber = ? AND id != ?");
        $uStmt->execute([$roomNumber, $roomId]);
        if ($uStmt->fetch()) {
            jsonResponse(['message' => 'Room number already exists'], 400);
        }
    }
    
    $now = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare("UPDATE rooms SET roomNumber = ?, floor = ?, capacity = ?, hostelBlock = ?, updatedAt = ? WHERE id = ?");
    $stmt->execute([$roomNumber, $floor, $capacity, $hostelBlock, $now, $roomId]);
    
    jsonResponse(['message' => 'Room updated successfully'], 200);
}

if ($method === 'DELETE' && preg_match('~^/api/admin/rooms/([a-f0-9]{24})$~', $path, $matches)) {
    requireRole(['admin']);
    $roomId = $matches[1];
    
    $stmt = $pdo->prepare("SELECT * FROM rooms WHERE id = ?");
    $stmt->execute([$roomId]);
    $room = $stmt->fetch();
    
    if (!$room) {
        jsonResponse(['message' => 'Room not found'], 404);
    }
    
    if ($room['occupiedBeds'] > 0) {
        jsonResponse(['message' => 'Cannot delete room with occupied beds'], 400);
    }
    
    $stmt = $pdo->prepare("DELETE FROM rooms WHERE id = ?");
    $stmt->execute([$roomId]);
    
    jsonResponse(['message' => 'Room deleted successfully'], 200);
}

// Student specific Services
if ($method === 'GET' && $path === '/api/student/my-room') {
    $currentUser = requireRole(['student']);
    
    $stmt = $pdo->prepare("SELECT roomId FROM student_applications WHERE studentId = ? AND status = 'approved'");
    $stmt->execute([$currentUser['id']]);
    $app = $stmt->fetch();
    
    if (!$app || !$app['roomId']) {
        jsonResponse(['message' => 'No room assigned yet'], 404);
    }
    
    $stmt = $pdo->prepare("SELECT * FROM rooms WHERE id = ?");
    $stmt->execute([$app['roomId']]);
    $room = $stmt->fetch();
    
    if (!$room) {
        jsonResponse(['message' => 'Assigned room details not found'], 404);
    }
    
    $stmt = $pdo->prepare("SELECT id, name, email, department, semester FROM student_applications WHERE roomId = ? AND studentId != ? AND status = 'approved'");
    $stmt->execute([$app['roomId'], $currentUser['id']]);
    $roommates = $stmt->fetchAll();
    foreach ($roommates as &$rm) {
        $rm['_id'] = $rm['id'];
    }
    
    $room['_id'] = $room['id'];
    $room['roommates'] = $roommates;
    
    jsonResponse($room, 200);
}

if ($method === 'GET' && $path === '/api/student/profile') {
    $currentUser = requireRole(['student']);
    
    $stmt = $pdo->prepare("SELECT a.*, r.roomNumber, r.floor, r.hostelBlock FROM student_applications a LEFT JOIN rooms r ON a.roomId = r.id WHERE a.studentId = ? AND a.status = 'approved'");
    $stmt->execute([$currentUser['id']]);
    $profile = $stmt->fetch();
    
    if (!$profile) {
        jsonResponse(['message' => 'Profile not found'], 404);
    }
    
    $profile['_id'] = $profile['id'];
    if ($profile['roomId']) {
        $profile['room'] = [
            '_id' => $profile['roomId'],
            'roomNumber' => $profile['roomNumber'],
            'floor' => $profile['floor'],
            'hostelBlock' => $profile['hostelBlock']
        ];
    } else {
        $profile['room'] = null;
    }
    
    jsonResponse($profile, 200);
}

if ($method === 'GET' && $path === '/api/admin/students') {
    requireRole(['admin']);
    
    $stmt = $pdo->query("SELECT a.*, r.roomNumber FROM student_applications a LEFT JOIN rooms r ON a.roomId = r.id WHERE a.status = 'approved' ORDER BY a.name ASC");
    $students = $stmt->fetchAll();
    foreach ($students as &$student) {
        $student['_id'] = $student['id'];
        $student['roomNumber'] = $student['roomNumber'] ?? 'Not Assigned';
    }
    jsonResponse($students, 200);
}

if ($method === 'DELETE' && preg_match('~^/api/admin/students/([a-f0-9]{24})$~', $path, $matches)) {
    requireRole(['admin']);
    $studentAppId = $matches[1];
    
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("SELECT * FROM student_applications WHERE id = ?");
        $stmt->execute([$studentAppId]);
        $app = $stmt->fetch();
        
        if (!$app) {
            $pdo->rollBack();
            jsonResponse(['message' => 'Student record not found'], 404);
        }
        
        $roomId = $app['roomId'];
        $studentUserId = $app['studentId'];
        
        $stmt = $pdo->prepare("DELETE FROM student_applications WHERE id = ?");
        $stmt->execute([$studentAppId]);
        
        if ($studentUserId) {
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$studentUserId]);
        }
        
        if ($roomId) {
            $stmt = $pdo->prepare("UPDATE rooms SET occupiedBeds = MAX(0, occupiedBeds - 1), updatedAt = ? WHERE id = ?");
            $stmt->execute([date('Y-m-d H:i:s'), $roomId]);
        }
        
        $pdo->commit();
        jsonResponse(['message' => 'Student deleted successfully'], 200);
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(['message' => 'Deletion failed: ' . $e->getMessage()], 500);
    }
}

if ($method === 'GET' && $path === '/api/admin/rooms-with-students') {
    requireRole(['admin']);
    
    $stmt = $pdo->query("SELECT * FROM rooms ORDER BY roomNumber ASC");
    $rooms = $stmt->fetchAll();
    foreach ($rooms as &$room) {
        $room['_id'] = $room['id'];
        
        $sStmt = $pdo->prepare("SELECT id, name, email, phone, department, semester FROM student_applications WHERE roomId = ? AND status = 'approved'");
        $sStmt->execute([$room['id']]);
        $students = $sStmt->fetchAll();
        foreach ($students as &$s) {
            $s['_id'] = $s['id'];
        }
        $room['students'] = $students;
    }
    jsonResponse($rooms, 200);
}

// Notice board Services
if ($method === 'GET' && $path === '/api/notices') {
    $activeOnly = isset($_GET['activeOnly']) && $_GET['activeOnly'] === 'true';
    
    $sql = "SELECT n.*, u.name as creatorName FROM notices n JOIN users u ON n.createdBy = u.id";
    if ($activeOnly) {
        $sql .= " WHERE n.isActive = 1";
    }
    $sql .= " ORDER BY n.createdAt DESC";
    
    $stmt = $pdo->query($sql);
    $notices = $stmt->fetchAll();
    foreach ($notices as &$notice) {
        $notice['_id'] = $notice['id'];
        $notice['isActive'] = (bool)$notice['isActive'];
        $notice['creator'] = [
            'name' => $notice['creatorName']
        ];
    }
    jsonResponse($notices, 200);
}

if ($method === 'POST' && $path === '/api/notices') {
    $currentUser = requireRole(['admin']);
    $input = getJsonInput();
    $title = $input['title'] ?? '';
    $content = $input['content'] ?? '';
    $priority = $input['priority'] ?? 'normal';
    
    if (empty($title) || empty($content)) {
        jsonResponse(['message' => 'Title and content are required'], 400);
    }
    
    $noticeId = generateId();
    $now = date('Y-m-d H:i:s');
    
    $stmt = $pdo->prepare("INSERT INTO notices (id, title, content, priority, createdBy, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 1, ?, ?)");
    $stmt->execute([$noticeId, $title, $content, $priority, $currentUser['id'], $now, $now]);
    
    $studentsStmt = $pdo->query("SELECT id FROM users WHERE role = 'student'");
    $students = $studentsStmt->fetchAll();
    foreach ($students as $student) {
        $nId = generateId();
        $notifStmt = $pdo->prepare("INSERT INTO notifications (id, recipientId, recipientType, title, message, type, relatedId, isRead, createdAt) VALUES (?, ?, 'student', 'New Notice Notice', ?, 'notice', ?, 0, ?)");
        $notifStmt->execute([$nId, $student['id'], "Admin published a new notice: $title", $noticeId, $now]);
    }
    
    jsonResponse([
        '_id' => $noticeId,
        'title' => $title,
        'content' => $content,
        'priority' => $priority,
        'isActive' => true,
        'createdBy' => $currentUser['id'],
        'createdAt' => $now
    ], 201);
}

if ($method === 'PUT' && preg_match('~^/api/notices/([a-f0-9]{24})$~', $path, $matches)) {
    requireRole(['admin']);
    $noticeId = $matches[1];
    $input = getJsonInput();
    
    $stmt = $pdo->prepare("SELECT * FROM notices WHERE id = ?");
    $stmt->execute([$noticeId]);
    $notice = $stmt->fetch();
    
    if (!$notice) {
        jsonResponse(['message' => 'Notice not found'], 404);
    }
    
    $title = $input['title'] ?? $notice['title'];
    $content = $input['content'] ?? $notice['content'];
    $priority = $input['priority'] ?? $notice['priority'];
    $now = date('Y-m-d H:i:s');
    
    $stmt = $pdo->prepare("UPDATE notices SET title = ?, content = ?, priority = ?, updatedAt = ? WHERE id = ?");
    $stmt->execute([$title, $content, $priority, $now, $noticeId]);
    
    jsonResponse(['message' => 'Notice updated successfully'], 200);
}

if ($method === 'DELETE' && preg_match('~^/api/notices/([a-f0-9]{24})$~', $path, $matches)) {
    requireRole(['admin']);
    $noticeId = $matches[1];
    
    $stmt = $pdo->prepare("SELECT id FROM notices WHERE id = ?");
    $stmt->execute([$noticeId]);
    if (!$stmt->fetch()) {
        jsonResponse(['message' => 'Notice not found'], 404);
    }
    
    $stmt = $pdo->prepare("DELETE FROM notices WHERE id = ?");
    $stmt->execute([$noticeId]);
    
    jsonResponse(['message' => 'Notice deleted successfully'], 200);
}

if ($method === 'PATCH' && preg_match('~^/api/notices/([a-f0-9]{24})/toggle$~', $path, $matches)) {
    requireRole(['admin']);
    $noticeId = $matches[1];
    
    $stmt = $pdo->prepare("SELECT * FROM notices WHERE id = ?");
    $stmt->execute([$noticeId]);
    $notice = $stmt->fetch();
    
    if (!$notice) {
        jsonResponse(['message' => 'Notice not found'], 404);
    }
    
    $newStatus = $notice['isActive'] ? 0 : 1;
    $now = date('Y-m-d H:i:s');
    
    $stmt = $pdo->prepare("UPDATE notices SET isActive = ?, updatedAt = ? WHERE id = ?");
    $stmt->execute([$newStatus, $now, $noticeId]);
    
    jsonResponse(['message' => 'Notice status toggled successfully', 'isActive' => (bool)$newStatus], 200);
}

// Complaint Services
if ($method === 'POST' && $path === '/api/complaints') {
    $currentUser = requireRole(['student']);
    $input = getJsonInput();
    $title = $input['title'] ?? '';
    $description = $input['description'] ?? '';
    $category = $input['category'] ?? 'Other';
    
    if (empty($title) || empty($description)) {
        jsonResponse(['message' => 'Title and description are required'], 400);
    }
    
    $stmt = $pdo->prepare("SELECT r.roomNumber FROM student_applications a JOIN rooms r ON a.roomId = r.id WHERE a.studentId = ? AND a.status = 'approved'");
    $stmt->execute([$currentUser['id']]);
    $room = $stmt->fetch();
    $roomNumber = $room['roomNumber'] ?? 'N/A';
    
    $complaintId = generateId();
    $now = date('Y-m-d H:i:s');
    
    $stmt = $pdo->prepare("INSERT INTO complaints (id, studentId, studentName, roomNumber, title, description, category, status, adminReply, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', '', ?, ?)");
    $stmt->execute([$complaintId, $currentUser['id'], $currentUser['name'], $roomNumber, $title, $description, $category, $now, $now]);
    
    $adminsStmt = $pdo->query("SELECT id FROM users WHERE role = 'admin'");
    $admins = $adminsStmt->fetchAll();
    foreach ($admins as $admin) {
        $nId = generateId();
        $notifStmt = $pdo->prepare("INSERT INTO notifications (id, recipientId, recipientType, title, message, type, relatedId, isRead, createdAt) VALUES (?, ?, 'admin', 'New Complaint', ?, 'complaint', ?, 0, ?)");
        $notifStmt->execute([$nId, $admin['id'], "New complaint submitted by " . $currentUser['name'], $complaintId, $now]);
    }
    
    jsonResponse(['message' => 'Complaint submitted successfully', 'id' => $complaintId], 201);
}

if ($method === 'GET' && $path === '/api/complaints/my') {
    $currentUser = requireRole(['student']);
    
    $stmt = $pdo->prepare("SELECT * FROM complaints WHERE studentId = ? ORDER BY createdAt DESC");
    $stmt->execute([$currentUser['id']]);
    $complaints = $stmt->fetchAll();
    foreach ($complaints as &$c) {
        $c['_id'] = $c['id'];
    }
    jsonResponse($complaints, 200);
}

if ($method === 'GET' && $path === '/api/admin/complaints') {
    requireRole(['admin']);
    $status = $_GET['status'] ?? null;
    
    if ($status) {
        $stmt = $pdo->prepare("SELECT * FROM complaints WHERE status = ? ORDER BY createdAt DESC");
        $stmt->execute([$status]);
    } else {
        $stmt = $pdo->query("SELECT * FROM complaints ORDER BY createdAt DESC");
    }
    $complaints = $stmt->fetchAll();
    foreach ($complaints as &$c) {
        $c['_id'] = $c['id'];
    }
    jsonResponse($complaints, 200);
}

if ($method === 'PUT' && preg_match('~^/api/admin/complaints/([a-f0-9]{24})$~', $path, $matches)) {
    requireRole(['admin']);
    $complaintId = $matches[1];
    $input = getJsonInput();
    $status = $input['status'] ?? '';
    $adminReply = $input['adminReply'] ?? '';
    
    if (empty($status)) {
        jsonResponse(['message' => 'Status is required'], 400);
    }
    
    $stmt = $pdo->prepare("SELECT * FROM complaints WHERE id = ?");
    $stmt->execute([$complaintId]);
    $complaint = $stmt->fetch();
    
    if (!$complaint) {
        jsonResponse(['message' => 'Complaint not found'], 404);
    }
    
    $now = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare("UPDATE complaints SET status = ?, adminReply = ?, updatedAt = ? WHERE id = ?");
    $stmt->execute([$status, $adminReply, $now, $complaintId]);
    
    $nId = generateId();
    $notifStmt = $pdo->prepare("INSERT INTO notifications (id, recipientId, recipientType, title, message, type, relatedId, isRead, createdAt) VALUES (?, ?, 'student', 'Complaint Updated', ?, 'complaint', ?, 0, ?)");
    $notifStmt->execute([$nId, $complaint['studentId'], "Your complaint status has been updated to '$status'.", $complaintId, $now]);
    
    jsonResponse(['message' => 'Complaint updated successfully'], 200);
}

// Room Change Services
if ($method === 'POST' && $path === '/api/room-change/request') {
    $currentUser = requireRole(['student']);
    $input = getJsonInput();
    $preferredRoomId = $input['preferredRoomId'] ?? '';
    $reason = $input['reason'] ?? '';
    
    if (empty($preferredRoomId) || empty($reason)) {
        jsonResponse(['message' => 'Preferred room and reason are required'], 400);
    }
    
    $stmt = $pdo->prepare("SELECT id, roomId FROM student_applications WHERE studentId = ? AND status = 'approved'");
    $stmt->execute([$currentUser['id']]);
    $app = $stmt->fetch();
    
    if (!$app || !$app['roomId']) {
        jsonResponse(['message' => 'You must have an assigned room to request a change'], 400);
    }
    
    if ($app['roomId'] === $preferredRoomId) {
        jsonResponse(['message' => 'Preferred room cannot be your current room'], 400);
    }
    
    $stmt = $pdo->prepare("SELECT id FROM room_change_requests WHERE studentId = ? AND status = 'pending'");
    $stmt->execute([$currentUser['id']]);
    if ($stmt->fetch()) {
        jsonResponse(['message' => 'You already have a pending room change request'], 400);
    }
    
    $requestId = generateId();
    $now = date('Y-m-d H:i:s');
    
    $stmt = $pdo->prepare("INSERT INTO room_change_requests (id, studentId, applicationId, currentRoomId, preferredRoomId, reason, status, rejectionComment, reviewedBy, reviewedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 'pending', NULL, NULL, NULL, ?, ?)");
    $stmt->execute([$requestId, $currentUser['id'], $app['id'], $app['roomId'], $preferredRoomId, $reason, $now, $now]);
    
    $adminsStmt = $pdo->query("SELECT id FROM users WHERE role = 'admin'");
    $admins = $adminsStmt->fetchAll();
    foreach ($admins as $admin) {
        $nId = generateId();
        $notifStmt = $pdo->prepare("INSERT INTO notifications (id, recipientId, recipientType, title, message, type, relatedId, isRead, createdAt) VALUES (?, ?, 'admin', 'Room Change Request', ?, 'room_change', ?, 0, ?)");
        $notifStmt->execute([$nId, $admin['id'], "New room change request from " . $currentUser['name'], $requestId, $now]);
    }
    
    jsonResponse(['message' => 'Room change request submitted successfully'], 201);
}

if ($method === 'GET' && $path === '/api/room-change/my') {
    $currentUser = requireRole(['student']);
    
    $stmt = $pdo->prepare("
        SELECT rcr.*, 
               cr.roomNumber as currentRoomNumber, cr.floor as currentRoomFloor, cr.hostelBlock as currentRoomBlock,
               pr.roomNumber as preferredRoomNumber, pr.floor as preferredRoomFloor, pr.hostelBlock as preferredRoomBlock
        FROM room_change_requests rcr
        JOIN rooms cr ON rcr.currentRoomId = cr.id
        JOIN rooms pr ON rcr.preferredRoomId = pr.id
        WHERE rcr.studentId = ? 
        ORDER BY rcr.createdAt DESC
    ");
    $stmt->execute([$currentUser['id']]);
    $requests = $stmt->fetchAll();
    
    foreach ($requests as &$r) {
        $r['_id'] = $r['id'];
        $r['currentRoom'] = [
            '_id' => $r['currentRoomId'],
            'roomNumber' => $r['currentRoomNumber'],
            'floor' => $r['currentRoomFloor'],
            'hostelBlock' => $r['currentRoomBlock']
        ];
        $r['preferredRoom'] = [
            '_id' => $r['preferredRoomId'],
            'roomNumber' => $r['preferredRoomNumber'],
            'floor' => $r['preferredRoomFloor'],
            'hostelBlock' => $r['preferredRoomBlock']
        ];
    }
    jsonResponse($requests, 200);
}

if ($method === 'GET' && $path === '/api/admin/room-change-requests') {
    requireRole(['admin']);
    $status = $_GET['status'] ?? null;
    
    $sql = "
        SELECT rcr.*, u.name as studentName,
               cr.roomNumber as currentRoomNumber, cr.floor as currentRoomFloor, cr.hostelBlock as currentRoomBlock,
               pr.roomNumber as preferredRoomNumber, pr.floor as preferredRoomFloor, pr.hostelBlock as preferredRoomBlock
        FROM room_change_requests rcr
        JOIN users u ON rcr.studentId = u.id
        JOIN rooms cr ON rcr.currentRoomId = cr.id
        JOIN rooms pr ON rcr.preferredRoomId = pr.id
    ";
    
    if ($status) {
        $sql .= " WHERE rcr.status = :status";
    }
    $sql .= " ORDER BY rcr.createdAt DESC";
    
    $stmt = $pdo->prepare($sql);
    if ($status) {
        $stmt->bindValue(':status', $status);
    }
    $stmt->execute();
    $requests = $stmt->fetchAll();
    
    foreach ($requests as &$r) {
        $r['_id'] = $r['id'];
        $r['studentId'] = [
            '_id' => $r['studentId'],
            'name' => $r['studentName']
        ];
        $r['currentRoomId'] = [
            '_id' => $r['currentRoomId'],
            'roomNumber' => $r['currentRoomNumber'],
            'floor' => $r['currentRoomFloor'],
            'hostelBlock' => $r['currentRoomBlock']
        ];
        $r['preferredRoomId'] = [
            '_id' => $r['preferredRoomId'],
            'roomNumber' => $r['preferredRoomNumber'],
            'floor' => $r['preferredRoomFloor'],
            'hostelBlock' => $r['preferredRoomBlock']
        ];
    }
    jsonResponse($requests, 200);
}

if ($method === 'PUT' && preg_match('~^/api/admin/room-change/([a-f0-9]{24})/approve$~', $path, $matches)) {
    $currentUser = requireRole(['admin']);
    $requestId = $matches[1];
    
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("SELECT * FROM room_change_requests WHERE id = ?");
        $stmt->execute([$requestId]);
        $request = $stmt->fetch();
        
        if (!$request) {
            $pdo->rollBack();
            jsonResponse(['message' => 'Request not found'], 404);
        }
        
        if ($request['status'] !== 'pending') {
            $pdo->rollBack();
            jsonResponse(['message' => 'Request already processed'], 400);
        }
        
        $stmt = $pdo->prepare("SELECT * FROM rooms WHERE id = ?");
        $stmt->execute([$request['preferredRoomId']]);
        $prefRoom = $stmt->fetch();
        
        if (!$prefRoom) {
            $pdo->rollBack();
            jsonResponse(['message' => 'Preferred room not found'], 404);
        }
        
        if ($prefRoom['occupiedBeds'] >= $prefRoom['capacity']) {
            $pdo->rollBack();
            jsonResponse(['message' => 'Preferred room is full'], 400);
        }
        
        $now = date('Y-m-d H:i:s');
        
        $stmt = $pdo->prepare("UPDATE rooms SET occupiedBeds = MAX(0, occupiedBeds - 1), updatedAt = ? WHERE id = ?");
        $stmt->execute([$now, $request['currentRoomId']]);
        
        $stmt = $pdo->prepare("UPDATE rooms SET occupiedBeds = occupiedBeds + 1, updatedAt = ? WHERE id = ?");
        $stmt->execute([$now, $request['preferredRoomId']]);
        
        $stmt = $pdo->prepare("UPDATE student_applications SET roomId = ?, updatedAt = ? WHERE id = ?");
        $stmt->execute([$request['preferredRoomId'], $now, $request['applicationId']]);
        
        $stmt = $pdo->prepare("UPDATE room_change_requests SET status = 'approved', reviewedBy = ?, reviewedAt = ?, updatedAt = ? WHERE id = ?");
        $stmt->execute([$currentUser['id'], $now, $now, $requestId]);
        
        $nId = generateId();
        $notifStmt = $pdo->prepare("INSERT INTO notifications (id, recipientId, recipientType, title, message, type, relatedId, isRead, createdAt) VALUES (?, ?, 'student', 'Room Change Approved', ?, 'room_change_approved', ?, 0, ?)");
        $notifStmt->execute([$nId, $request['studentId'], "Your room change request to room " . $prefRoom['roomNumber'] . " has been approved.", $requestId, $now]);
        
        $pdo->commit();
        jsonResponse(['message' => 'Room change request approved successfully'], 200);
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(['message' => 'Failed to approve request: ' . $e->getMessage()], 500);
    }
}

if ($method === 'PUT' && preg_match('~^/api/admin/room-change/([a-f0-9]{24})/reject$~', $path, $matches)) {
    $currentUser = requireRole(['admin']);
    $requestId = $matches[1];
    $input = getJsonInput();
    $rejectionComment = $input['rejectionComment'] ?? '';
    
    if (empty($rejectionComment)) {
        jsonResponse(['message' => 'Rejection comment is required'], 400);
    }
    
    $stmt = $pdo->prepare("SELECT * FROM room_change_requests WHERE id = ?");
    $stmt->execute([$requestId]);
    $request = $stmt->fetch();
    
    if (!$request) {
        jsonResponse(['message' => 'Request not found'], 404);
    }
    
    if ($request['status'] !== 'pending') {
        jsonResponse(['message' => 'Request already processed'], 400);
    }
    
    $now = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare("UPDATE room_change_requests SET status = 'rejected', rejectionComment = ?, reviewedBy = ?, reviewedAt = ?, updatedAt = ? WHERE id = ?");
    $stmt->execute([$rejectionComment, $currentUser['id'], $now, $now, $requestId]);
    
    $nId = generateId();
    $notifStmt = $pdo->prepare("INSERT INTO notifications (id, recipientId, recipientType, title, message, type, relatedId, isRead, createdAt) VALUES (?, ?, 'student', 'Room Change Rejected', ?, 'room_change_rejected', ?, 0, ?)");
    $notifStmt->execute([$nId, $request['studentId'], "Your room change request has been rejected. Reason: $rejectionComment", $requestId, $now]);
    
    jsonResponse(['message' => 'Room change request rejected successfully'], 200);
}

// Notification board Services
if ($method === 'GET' && $path === '/api/notifications') {
    $currentUser = requireAuth();
    
    $stmt = $pdo->prepare("SELECT * FROM notifications WHERE recipientId = ? ORDER BY createdAt DESC");
    $stmt->execute([$currentUser['id']]);
    $notifications = $stmt->fetchAll();
    foreach ($notifications as &$n) {
        $n['_id'] = $n['id'];
        $n['isRead'] = (bool)$n['isRead'];
    }
    jsonResponse($notifications, 200);
}

if ($method === 'GET' && $path === '/api/notifications/unread-count') {
    $currentUser = requireAuth();
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE recipientId = ? AND isRead = 0");
    $stmt->execute([$currentUser['id']]);
    $count = $stmt->fetchColumn();
    jsonResponse(['count' => intval($count)], 200);
}

if ($method === 'PUT' && preg_match('~^/api/notifications/([a-f0-9]{24})/read$~', $path, $matches)) {
    $currentUser = requireAuth();
    $notifId = $matches[1];
    
    $stmt = $pdo->prepare("UPDATE notifications SET isRead = 1 WHERE id = ? AND recipientId = ?");
    $stmt->execute([$notifId, $currentUser['id']]);
    jsonResponse(['message' => 'Notification marked as read'], 200);
}

if ($method === 'PUT' && $path === '/api/notifications/mark-all-read') {
    $currentUser = requireAuth();
    
    $stmt = $pdo->prepare("UPDATE notifications SET isRead = 1 WHERE recipientId = ?");
    $stmt->execute([$currentUser['id']]);
    jsonResponse(['message' => 'All notifications marked as read'], 200);
}

if ($method === 'DELETE' && preg_match('~^/api/notifications/([a-f0-9]{24})$~', $path, $matches)) {
    $currentUser = requireAuth();
    $notifId = $matches[1];
    
    $stmt = $pdo->prepare("DELETE FROM notifications WHERE id = ? AND recipientId = ?");
    $stmt->execute([$notifId, $currentUser['id']]);
    jsonResponse(['message' => 'Notification deleted successfully'], 200);
}

// AI Chatbot
if ($method === 'POST' && $path === '/api/chat') {
    requireAuth();
    $input = getJsonInput();
    $message = strtolower($input['message'] ?? '');
    
    $reply = "I'm the Smart Hostel AI Assistant. You can ask me about rooms, rules, or submit a request.";
    
    if (strpos($message, 'hello') !== false || strpos($message, 'hi') !== false) {
        $reply = "Hello! How can I assist you with your hostel operations today?";
    } elseif (strpos($message, 'room') !== false) {
        $reply = "You can view available rooms in the 'Rooms' tab. If you are a student, you can apply for a Room Change request in your dashboard.";
    } elseif (strpos($message, 'rule') !== false || strpos($message, 'regulation') !== false) {
        $reply = "Hostel Rules require students to return by 10:00 PM. No unauthorized visitors are allowed in the residential wings.";
    } elseif (strpos($message, 'leave') !== false) {
        $reply = "To take leave, please submit a Leave Request (Overnight or Day Outing) in your portal, subject to admin approval.";
    } elseif (strpos($message, 'complaint') !== false) {
        $reply = "You can submit maintenance complaints (Plumbing, Electricity, etc.) under the 'Complaints' tab. Admins will address them promptly.";
    } elseif (strpos($message, 'contact') !== false || strpos($message, 'support') !== false) {
        $reply = "You can contact support at support@smarthostel.com or call the warden office directly.";
    }
    jsonResponse(['reply' => $reply], 200);
}

if ($method === 'DELETE' && $path === '/api/chat/clear') {
    requireAuth();
    jsonResponse(['message' => 'Chat history cleared'], 200);
}

// Leave request Services
if ($method === 'POST' && $path === '/api/student/leave') {
    $currentUser = requireRole(['student']);
    $input = getJsonInput();
    
    $leaveType = $input['leaveType'] ?? '';
    $fromDate = $input['fromDate'] ?? '';
    $toDate = $input['toDate'] ?? '';
    $destination = $input['destination'] ?? '';
    $reason = $input['reason'] ?? '';
    $guardianName = $input['guardianName'] ?? '';
    $guardianEmail = $input['guardianEmail'] ?? '';
    $guardianContact = $input['guardianContact'] ?? '';
    
    if (empty($leaveType) || empty($fromDate) || empty($toDate) || empty($destination) || empty($reason) || empty($guardianName) || empty($guardianContact)) {
        jsonResponse(['message' => 'All fields are required'], 400);
    }
    
    $stmt = $pdo->prepare("SELECT r.roomNumber FROM student_applications a JOIN rooms r ON a.roomId = r.id WHERE a.studentId = ? AND a.status = 'approved'");
    $stmt->execute([$currentUser['id']]);
    $room = $stmt->fetch();
    $roomNumber = $room['roomNumber'] ?? 'N/A';
    
    $leaveId = generateId();
    $now = date('Y-m-d H:i:s');
    
    $stmt = $pdo->prepare("INSERT INTO leave_requests (id, studentId, studentName, roomNumber, leaveType, fromDate, toDate, destination, reason, guardianName, guardianEmail, guardianContact, status, adminRemarks, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', '', ?, ?)");
    $stmt->execute([$leaveId, $currentUser['id'], $currentUser['name'], $roomNumber, $leaveType, $fromDate, $toDate, $destination, $reason, $guardianName, $guardianEmail, $guardianContact, $now, $now]);
    
    $adminsStmt = $pdo->query("SELECT id FROM users WHERE role = 'admin'");
    $admins = $adminsStmt->fetchAll();
    foreach ($admins as $admin) {
        $nId = generateId();
        $notifStmt = $pdo->prepare("INSERT INTO notifications (id, recipientId, recipientType, title, message, type, relatedId, isRead, createdAt) VALUES (?, ?, 'admin', 'Leave Request', ?, 'leave_request', ?, 0, ?)");
        $notifStmt->execute([$nId, $admin['id'], "New leave request submitted by " . $currentUser['name'], $leaveId, $now]);
    }
    
    jsonResponse(['message' => 'Leave request submitted successfully'], 201);
}

if ($method === 'GET' && $path === '/api/student/my-leaves') {
    $currentUser = requireRole(['student']);
    
    $stmt = $pdo->prepare("SELECT * FROM leave_requests WHERE studentId = ? ORDER BY createdAt DESC");
    $stmt->execute([$currentUser['id']]);
    $leaves = $stmt->fetchAll();
    foreach ($leaves as &$l) {
        $l['_id'] = $l['id'];
    }
    jsonResponse($leaves, 200);
}

if ($method === 'GET' && $path === '/api/admin/leave-requests') {
    requireRole(['admin']);
    $status = $_GET['status'] ?? null;
    
    if ($status) {
        $stmt = $pdo->prepare("SELECT * FROM leave_requests WHERE status = ? ORDER BY createdAt DESC");
        $stmt->execute([$status]);
    } else {
        $stmt = $pdo->query("SELECT * FROM leave_requests ORDER BY createdAt DESC");
    }
    $leaves = $stmt->fetchAll();
    foreach ($leaves as &$l) {
        $l['_id'] = $l['id'];
    }
    jsonResponse($leaves, 200);
}

if ($method === 'PUT' && preg_match('~^/api/admin/leave-approve/([a-f0-9]{24})$~', $path, $matches)) {
    $currentUser = requireRole(['admin']);
    $leaveId = $matches[1];
    $input = getJsonInput();
    $adminRemarks = $input['adminRemarks'] ?? '';
    
    $stmt = $pdo->prepare("SELECT * FROM leave_requests WHERE id = ?");
    $stmt->execute([$leaveId]);
    $leave = $stmt->fetch();
    
    if (!$leave) {
        jsonResponse(['message' => 'Leave request not found'], 404);
    }
    
    if ($leave['status'] !== 'Pending') {
        jsonResponse(['message' => 'Leave request already processed'], 400);
    }
    
    $now = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare("UPDATE leave_requests SET status = 'Approved', adminRemarks = ?, updatedAt = ? WHERE id = ?");
    $stmt->execute([$adminRemarks, $now, $leaveId]);
    
    $nId = generateId();
    $notifStmt = $pdo->prepare("INSERT INTO notifications (id, recipientId, recipientType, title, message, type, relatedId, isRead, createdAt) VALUES (?, ?, 'student', 'Leave Request Approved', ?, 'leave_request_approved', ?, 0, ?)");
    $notifStmt->execute([$nId, $leave['studentId'], "Your leave request from " . $leave['fromDate'] . " has been approved.", $leaveId, $now]);
    
    jsonResponse(['message' => 'Leave request approved successfully'], 200);
}

if ($method === 'PUT' && preg_match('~^/api/admin/leave-reject/([a-f0-9]{24})$~', $path, $matches)) {
    $currentUser = requireRole(['admin']);
    $leaveId = $matches[1];
    $input = getJsonInput();
    $adminRemarks = $input['adminRemarks'] ?? '';
    
    $stmt = $pdo->prepare("SELECT * FROM leave_requests WHERE id = ?");
    $stmt->execute([$leaveId]);
    $leave = $stmt->fetch();
    
    if (!$leave) {
        jsonResponse(['message' => 'Leave request not found'], 404);
    }
    
    if ($leave['status'] !== 'Pending') {
        jsonResponse(['message' => 'Leave request already processed'], 400);
    }
    
    $now = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare("UPDATE leave_requests SET status = 'Rejected', adminRemarks = ?, updatedAt = ? WHERE id = ?");
    $stmt->execute([$adminRemarks, $now, $leaveId]);
    
    $nId = generateId();
    $notifStmt = $pdo->prepare("INSERT INTO notifications (id, recipientId, recipientType, title, message, type, relatedId, isRead, createdAt) VALUES (?, ?, 'student', 'Leave Request Rejected', ?, 'leave_request_rejected', ?, 0, ?)");
    $notifStmt->execute([$nId, $leave['studentId'], "Your leave request has been rejected. Remarks: $adminRemarks", $leaveId, $now]);
    
    jsonResponse(['message' => 'Leave request rejected successfully'], 200);
}

// Default fallback
jsonResponse(['message' => 'Endpoint not found: ' . $method . ' ' . $path], 404);
