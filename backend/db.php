<?php
// backend/db.php

$dbPath = __DIR__ . '/hostel.db';

try {
    $pdo = new PDO("sqlite:" . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec("PRAGMA foreign_keys = ON;");
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

// Helper to generate a 24-character hexadecimal MongoDB-like ID
function generateId() {
    return bin2hex(random_bytes(12));
}

// Create tables if they do not exist
$tables = [
    "users" => "CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
    )",
    
    "rooms" => "CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        roomNumber TEXT UNIQUE NOT NULL,
        floor TEXT NOT NULL,
        capacity INTEGER NOT NULL DEFAULT 4,
        occupiedBeds INTEGER NOT NULL DEFAULT 0,
        hostelBlock TEXT NOT NULL DEFAULT 'A',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
    )",
    
    "student_applications" => "CREATE TABLE IF NOT EXISTS student_applications (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        studentId TEXT NULL,
        password TEXT NOT NULL,
        fatherName TEXT NOT NULL,
        guardianEmail TEXT NOT NULL,
        phone TEXT NOT NULL,
        cnic TEXT NOT NULL,
        address TEXT NOT NULL,
        department TEXT NOT NULL,
        semester TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        roomId TEXT NULL,
        photo TEXT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE SET NULL
    )",
    
    "notices" => "CREATE TABLE IF NOT EXISTS notices (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'normal',
        createdBy TEXT NOT NULL,
        isActive INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
    )",
    
    "complaints" => "CREATE TABLE IF NOT EXISTS complaints (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        studentName TEXT NOT NULL,
        roomNumber TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'Other',
        status TEXT NOT NULL DEFAULT 'Pending',
        adminReply TEXT NOT NULL DEFAULT '',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
    )",
    
    "leave_requests" => "CREATE TABLE IF NOT EXISTS leave_requests (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        studentName TEXT NOT NULL,
        roomNumber TEXT NOT NULL,
        leaveType TEXT NOT NULL,
        fromDate TEXT NOT NULL,
        toDate TEXT NOT NULL,
        destination TEXT NOT NULL,
        reason TEXT NOT NULL,
        guardianName TEXT NOT NULL,
        guardianEmail TEXT NOT NULL,
        guardianContact TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        adminRemarks TEXT NOT NULL DEFAULT '',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
    )",
    
    "room_change_requests" => "CREATE TABLE IF NOT EXISTS room_change_requests (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        applicationId TEXT NOT NULL,
        currentRoomId TEXT NOT NULL,
        preferredRoomId TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        rejectionComment TEXT NULL,
        reviewedBy TEXT NULL,
        reviewedAt TEXT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (applicationId) REFERENCES student_applications(id) ON DELETE CASCADE,
        FOREIGN KEY (currentRoomId) REFERENCES rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (preferredRoomId) REFERENCES rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewedBy) REFERENCES users(id) ON DELETE SET NULL
    )",
    
    "notifications" => "CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        recipientId TEXT NOT NULL,
        recipientType TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        relatedId TEXT NULL,
        isRead INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (recipientId) REFERENCES users(id) ON DELETE CASCADE
    )"
];

foreach ($tables as $name => $sql) {
    try {
        $pdo->exec($sql);
    } catch (PDOException $e) {
        die("Failed to create table $name: " . $e->getMessage());
    }
}

// Seed initial default Admin user if users table is empty
$stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
if ($stmt->fetchColumn() == 0) {
    $adminId = generateId();
    $adminName = 'Admin User';
    $adminEmail = 'admin@hostel.com';
    $adminPassword = password_hash('admin123', PASSWORD_BCRYPT);
    $now = date('Y-m-d H:i:s');
    
    $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'admin', ?, ?)");
    $stmt->execute([$adminId, $adminName, $adminEmail, $adminPassword, $now, $now]);
}

// Seed initial default rooms if rooms table is empty
$stmt = $pdo->query("SELECT COUNT(*) FROM rooms");
if ($stmt->fetchColumn() == 0) {
    $rooms = [
        ['101', '1', 4, 0, 'A'],
        ['102', '1', 4, 0, 'A'],
        ['201', '2', 2, 0, 'B'],
        ['202', '2', 2, 0, 'B'],
        ['301', '3', 3, 0, 'C'],
        ['302', '3', 3, 0, 'C']
    ];
    
    $stmt = $pdo->prepare("INSERT INTO rooms (id, roomNumber, floor, capacity, occupiedBeds, hostelBlock, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $now = date('Y-m-d H:i:s');
    foreach ($rooms as $room) {
        $stmt->execute([generateId(), $room[0], $room[1], $room[2], $room[3], $room[4], $now, $now]);
    }
}
