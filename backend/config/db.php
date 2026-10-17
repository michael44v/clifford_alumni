<?php
// backend/config/db.php

require_once __DIR__ . '/config.php';

global $g_mysqli, $g_sqlite_pdo;
$g_mysqli = null;
$g_sqlite_pdo = null;

function getDBMode(): string {
    global $g_mysqli, $g_sqlite_pdo;
    if ($g_mysqli !== null) return 'mysqli';
    if ($g_sqlite_pdo !== null) return 'sqlite';

    $dbHost = getenv('DB_HOST') ?: '127.0.0.1';
    $dbPort = intval(getenv('DB_PORT') ?: 3306);
    $dbName = getenv('DB_NAME') ?: 'cuaa_db';
    $dbUser = getenv('DB_USER') ?: 'root';
    $dbPass = getenv('DB_PASS') ?: '';

    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    try {
        $g_mysqli = new mysqli($dbHost, $dbUser, $dbPass, $dbName, $dbPort);
        $g_mysqli->set_charset("utf8mb4");
        return 'mysqli';
    } catch (Exception $e) {
        try {
            $g_mysqli = new mysqli($dbHost, $dbUser, $dbPass, '', $dbPort);
            $g_mysqli->set_charset("utf8mb4");
            $g_mysqli->query("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $g_mysqli->select_db($dbName);
            initMysqliSchema($g_mysqli);
            return 'mysqli';
        } catch (Exception $ex) {
            // Fallback to SQLite PDO for local test sandbox when MySQL daemon is offline
            $sqlitePath = __DIR__ . '/../data/app.db';
            $isNew = !file_exists($sqlitePath);
            $g_sqlite_pdo = new PDO("sqlite:" . $sqlitePath, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            if ($isNew) {
                initSqliteFallbackSchema($g_sqlite_pdo);
            }
            return 'sqlite';
        }
    }
}

/**
 * Executes a prepared query safely using MySQLi or SQLite fallback
 */
function dbQuery(string $sql, array $params = []): mixed {
    $mode = getDBMode();
    global $g_mysqli, $g_sqlite_pdo;

    if ($mode === 'mysqli') {
        if (empty($params)) {
            $res = $g_mysqli->query($sql);
            if ($res === true) {
                return ['affected_rows' => $g_mysqli->affected_rows, 'insert_id' => $g_mysqli->insert_id];
            }
            if ($res instanceof mysqli_result) {
                $rows = $res->fetch_all(MYSQLI_ASSOC);
                $res->free();
                return $rows;
            }
            return $res;
        }

        $stmt = $g_mysqli->prepare($sql);
        if (!$stmt) {
            throw new Exception("MySQLi Prepare Error: " . $g_mysqli->error);
        }

        $types = '';
        foreach ($params as $p) {
            if (is_int($p)) {
                $types .= 'i';
            } elseif (is_float($p)) {
                $types .= 'd';
            } else {
                $types .= 's';
            }
        }

        $stmt->bind_param($types, ...$params);
        $stmt->execute();

        $result = $stmt->get_result();
        if ($result instanceof mysqli_result) {
            $rows = $result->fetch_all(MYSQLI_ASSOC);
            $stmt->close();
            return $rows;
        }

        $affectedRows = $stmt->affected_rows;
        $insertId = $stmt->insert_id;
        $stmt->close();

        return ['affected_rows' => $affectedRows, 'insert_id' => $insertId];
    } else {
        // SQLite Fallback
        // Convert MySQL specific SQL features for SQLite compatibility if needed
        $sqlSqlite = str_replace(['CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'LONGTEXT', 'AUTO_INCREMENT'], ['CURRENT_TIMESTAMP', 'TEXT', 'AUTOINCREMENT'], $sql);
        $stmt = $g_sqlite_pdo->prepare($sqlSqlite);
        $stmt->execute($params);

        if (stripos(trim($sql), 'SELECT') === 0) {
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        return ['affected_rows' => $stmt->rowCount(), 'insert_id' => $g_sqlite_pdo->lastInsertId()];
    }
}

/**
 * Fetch a single row using prepared query
 */
function dbQueryOne(string $sql, array $params = []): ?array {
    $rows = dbQuery($sql, $params);
    if (is_array($rows) && count($rows) > 0 && isset($rows[0]) && is_array($rows[0])) {
        return $rows[0];
    }
    return null;
}

function initMysqliSchema(mysqli $db): void {
    $sql = file_get_contents(__DIR__ . '/../database.sql');
    if ($sql) {
        $db->multi_query($sql);
        while ($db->more_results() && $db->next_result()) {
            if ($result = $db->store_result()) {
                $result->free();
            }
        }
    }
}

function initSqliteFallbackSchema(PDO $pdo): void {
    $sql = "
    CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, cloudinaryPublicId TEXT UNIQUE, secureUrl TEXT, resourceType TEXT DEFAULT 'image', format TEXT, width INTEGER, height INTEGER, bytes INTEGER, folder TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS graduating_sets (id TEXT PRIMARY KEY, setName TEXT UNIQUE, graduationYear INTEGER UNIQUE, description TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS faculties (id TEXT PRIMARY KEY, name TEXT UNIQUE, code TEXT UNIQUE, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS departments (id TEXT PRIMARY KEY, name TEXT UNIQUE, code TEXT UNIQUE, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS locations (id TEXT PRIMARY KEY, state TEXT, city TEXT, isDiaspora INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(state, city));
    CREATE TABLE IF NOT EXISTS official_alumni_directory (id TEXT PRIMARY KEY, matricNumber TEXT UNIQUE, firstName TEXT, lastName TEXT, graduatingSetId TEXT, facultyId TEXT, department TEXT, isRegistered INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS members (id TEXT PRIMARY KEY, email TEXT UNIQUE, passwordHash TEXT, matricNumber TEXT UNIQUE, memberType TEXT DEFAULT 'ALUMNI', role TEXT DEFAULT 'MEMBER', verificationStatus TEXT DEFAULT 'VERIFIED', firstName TEXT, lastName TEXT, phone TEXT, graduatingSetId TEXT, facultyId TEXT, department TEXT, locationId TEXT, diasporaCountry TEXT, diasporaCity TEXT, profession TEXT, company TEXT, bio TEXT, skills TEXT, profilePhotoMediaId TEXT, privacySettings TEXT, isAlumniOfWeek INTEGER DEFAULT 0, alumniOfWeekBio TEXT, isFeatured INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, deletedAt DATETIME);
    CREATE TABLE IF NOT EXISTS refresh_tokens (id TEXT PRIMARY KEY, memberId TEXT, hashedToken TEXT UNIQUE, deviceInfo TEXT, expiresAt DATETIME, isRevoked INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, title TEXT, slug TEXT UNIQUE, description TEXT, bannerMediaId TEXT, eventDate DATETIME, time TEXT, venue TEXT, isVirtual INTEGER DEFAULT 0, meetingLink TEXT, organizer TEXT DEFAULT 'CUAA', category TEXT DEFAULT 'General', capacity INTEGER, createdById TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS event_registrations (id TEXT PRIMARY KEY, eventId TEXT, memberId TEXT, status TEXT DEFAULT 'REGISTERED', registeredAt DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(eventId, memberId));
    CREATE TABLE IF NOT EXISTS news_announcements (id TEXT PRIMARY KEY, title TEXT, slug TEXT UNIQUE, content TEXT, category TEXT DEFAULT 'OFFICIAL_ANNOUNCEMENT', bannerMediaId TEXT, isPublished INTEGER DEFAULT 1, publishedAt DATETIME DEFAULT CURRENT_TIMESTAMP, createdById TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS gallery_albums (id TEXT PRIMARY KEY, title TEXT, description TEXT, category TEXT DEFAULT 'ALUMNI_EVENT', graduatingSetId TEXT, year INTEGER, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS gallery_photos (id TEXT PRIMARY KEY, albumId TEXT, mediaId TEXT, caption TEXT, uploadedById TEXT, isFeatured INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS business_listings (id TEXT PRIMARY KEY, memberId TEXT, businessName TEXT, category TEXT, industry TEXT, description TEXT, services TEXT, logoMediaId TEXT, bannerMediaId TEXT, address TEXT, stateCity TEXT, website TEXT, phone TEXT, email TEXT, status TEXT DEFAULT 'PENDING', rejectionReason TEXT, isFeatured INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS dues_items (id TEXT PRIMARY KEY, title TEXT, type TEXT DEFAULT 'ANNUAL_DUES', amount REAL, academicYear TEXT, isRequired INTEGER DEFAULT 1, description TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS donation_campaigns (id TEXT PRIMARY KEY, title TEXT, description TEXT, targetAmount REAL, raisedAmount REAL DEFAULT 0, startDate DATETIME DEFAULT CURRENT_TIMESTAMP, endDate DATETIME, isActive INTEGER DEFAULT 1, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS payment_records (id TEXT PRIMARY KEY, memberId TEXT, duesItemId TEXT, donationCampaignId TEXT, amount REAL, paymentMethod TEXT DEFAULT 'KORAPAY', transactionRef TEXT UNIQUE, receiptNumber TEXT UNIQUE, status TEXT DEFAULT 'PENDING', proofMediaId TEXT, paidAt DATETIME, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS welfare_requests (id TEXT PRIMARY KEY, memberId TEXT, category TEXT DEFAULT 'OTHER', urgency TEXT DEFAULT 'MEDIUM', status TEXT DEFAULT 'NEW', description TEXT, assignedOfficerId TEXT, internalNotes TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS discussion_posts (id TEXT PRIMARY KEY, authorId TEXT, category TEXT DEFAULT 'General', title TEXT, content TEXT, mediaId TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS discussion_comments (id TEXT PRIMARY KEY, postId TEXT, authorId TEXT, content TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS chat_messages (id TEXT PRIMARY KEY, senderId TEXT, receiverId TEXT, messageText TEXT, isRead INTEGER DEFAULT 0, sentAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, memberId TEXT, title TEXT, message TEXT, type TEXT DEFAULT 'GENERAL', isRead INTEGER DEFAULT 0, linkUrl TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS leadership_profiles (id TEXT PRIMARY KEY, name TEXT, position TEXT, biography TEXT, photoMediaId TEXT, photoUrl TEXT, memberId TEXT, termStart INTEGER, termEnd INTEGER, isCurrent INTEGER DEFAULT 1, orderIndex INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS impact_stats (id TEXT PRIMARY KEY, activeMembers INTEGER DEFAULT 0, totalDonations REAL DEFAULT 0, projectsFunded INTEGER DEFAULT 0, countriesCount INTEGER DEFAULT 0, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP);
    ";
    $pdo->exec($sql);

    // Initial Seeds
    $adminPassword = password_hash("AdminPassword123!", PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT OR IGNORE INTO members (id, email, passwordHash, firstName, lastName, role, verificationStatus, memberType) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute(['admin-default-uuid', 'admin@cuaa.org', $adminPassword, 'System', 'Admin', 'SUPER_ADMIN', 'VERIFIED', 'ALUMNI']);

    $sets = [
        ['set-2020', 'Alpha Set', 2020, 'First Graduating Set of Clifford University'],
        ['set-2021', 'Pioneer Set', 2021, 'Second Graduating Class'],
        ['set-2022', 'Apex Set', 2022, 'Third Graduating Class'],
        ['set-2023', 'Excel Set', 2023, 'Fourth Graduating Class'],
        ['set-2024', 'Summit Set', 2024, 'Fifth Graduating Class'],
        ['set-2025', 'Legacy Set', 2025, 'Sixth Graduating Class']
    ];
    $stmt = $pdo->prepare("INSERT OR IGNORE INTO graduating_sets (id, setName, graduationYear, description) VALUES (?, ?, ?, ?)");
    foreach ($sets as $s) { $stmt->execute($s); }

    $faculties = [
        ['fac-1', 'Faculty of Science', 'FSC'],
        ['fac-2', 'Faculty of Humanities', 'FHM'],
        ['fac-3', 'Faculty of Social and Management Sciences', 'SMS'],
        ['fac-4', 'Faculty of Law', 'FLW'],
        ['fac-5', 'OTHERS', 'OTH']
    ];
    $stmt = $pdo->prepare("INSERT OR IGNORE INTO faculties (id, name, code) VALUES (?, ?, ?)");
    foreach ($faculties as $f) { $stmt->execute($f); }

    $departments = [
        ['dept-1', 'Computer Science', 'CSC'],
        ['dept-2', 'Accounting', 'ACC'],
        ['dept-3', 'Business Administration', 'BUS'],
        ['dept-4', 'Mass Communication', 'MAC'],
        ['dept-5', 'Biochemistry', 'BCH'],
        ['dept-6', 'Microbiology', 'MCB'],
        ['dept-7', 'Economics', 'ECO'],
        ['dept-8', 'Law', 'LAW']
    ];
    $stmt = $pdo->prepare("INSERT OR IGNORE INTO departments (id, name, code) VALUES (?, ?, ?)");
    foreach ($departments as $d) { $stmt->execute($d); }

    $stmt = $pdo->prepare("INSERT OR IGNORE INTO impact_stats (id, activeMembers, totalDonations, projectsFunded, countriesCount) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute(['default-impact-stats', 1250, 45000000, 18, 12]);

    $stmt = $pdo->prepare("INSERT OR IGNORE INTO dues_items (id, title, type, amount, academicYear, isRequired, description) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute(['annual-dues-2025', '2025 Annual Alumni Membership Dues', 'ANNUAL_DUES', 10000, '2024/2025', 1, 'Standard annual dues for active alumni association membership.']);
}
