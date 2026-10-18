<?php
// backend/routes/admin.php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/auth.php';

function handleAdminRoutes(string $endpoint, string $method): void {
    // PUBLIC / UNPROTECTED LOOKUP READS FOR GRADUATING SETS, FACULTIES & DEPARTMENTS
    if ($method === 'GET' && $endpoint === '/api/admin/faculties') {
        jsonResponse(dbQuery("SELECT * FROM faculties ORDER BY name ASC"));
    }

    if ($method === 'GET' && $endpoint === '/api/admin/departments') {
        jsonResponse(dbQuery("SELECT * FROM departments ORDER BY name ASC"));
    }

    if ($method === 'GET' && $endpoint === '/api/admin/sets') {
        jsonResponse(dbQuery("SELECT * FROM graduating_sets ORDER BY graduationYear DESC"));
    }

    if ($method === 'GET' && ($endpoint === '/api/admin/leadership' || $endpoint === '/api/members/leadership')) {
        header('Cache-Control: public, max-age=60, stale-while-revalidate=300');
        $data = cacheRemember('leadership:list', 300, function() {
            return dbQuery("SELECT l.*, COALESCE(NULLIF(l.photoUrl, ''), med.secureUrl) as photoUrl, med.secureUrl as memberPhotoUrl
                            FROM leadership_profiles l
                            LEFT JOIN members m ON l.memberId = m.id
                            LEFT JOIN media med ON m.profilePhotoMediaId = med.id
                            ORDER BY l.orderIndex ASC, l.termStart DESC");
        });
        jsonResponse($data);
    }

    // Protected Admin Routes Require Auth
    $user = authenticateJWT();

    // GRADUATING SETS CRUD
    if ($method === 'POST' && $endpoint === '/api/admin/sets') {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        $body = getRequestBody();
        $setName = trim($body['setName'] ?? '');
        $graduationYear = intval($body['graduationYear'] ?? 0);
        $description = trim($body['description'] ?? '');

        if (!$setName || !$graduationYear) {
            jsonError("setName and graduationYear are required.");
        }

        $newId = generateUuid();
        dbQuery("INSERT INTO graduating_sets (id, setName, graduationYear, description) VALUES (?, ?, ?, ?)", [$newId, $setName, $graduationYear, $description]);

        jsonResponse(dbQueryOne("SELECT * FROM graduating_sets WHERE id = ?", [$newId]), 201);
    }

    if ($method === 'PUT' && preg_match('#^/api/admin/sets/([^/]+)$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        $setId = $m[1];
        $body = getRequestBody();
        $setName = trim($body['setName'] ?? '');
        $graduationYear = isset($body['graduationYear']) ? intval($body['graduationYear']) : null;
        $description = trim($body['description'] ?? '');

        $existing = dbQueryOne("SELECT * FROM graduating_sets WHERE id = ?", [$setId]);
        if (!$existing) jsonError("Graduating set not found", 404);

        $updName = $setName !== '' ? $setName : $existing['setName'];
        $updYear = $graduationYear !== null ? $graduationYear : $existing['graduationYear'];
        $updDesc = $description !== '' ? $description : $existing['description'];

        dbQuery("UPDATE graduating_sets SET setName = ?, graduationYear = ?, description = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [$updName, $updYear, $updDesc, $setId]);

        jsonResponse(dbQueryOne("SELECT * FROM graduating_sets WHERE id = ?", [$setId]));
    }

    if ($method === 'DELETE' && preg_match('#^/api/admin/sets/([^/]+)$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        dbQuery("DELETE FROM graduating_sets WHERE id = ?", [$m[1]]);
        jsonResponse(['message' => 'Graduating set deleted successfully']);
    }

    // FACULTIES CRUD
    if ($method === 'POST' && $endpoint === '/api/admin/faculties') {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        $body = getRequestBody();
        $name = trim($body['name'] ?? '');
        $code = trim($body['code'] ?? '');
        if (!$name) jsonError("Faculty name is required.");

        $newId = generateUuid();
        dbQuery("INSERT INTO faculties (id, name, code) VALUES (?, ?, ?)", [$newId, $name, $code ?: null]);

        jsonResponse(dbQueryOne("SELECT * FROM faculties WHERE id = ?", [$newId]), 201);
    }

    if ($method === 'DELETE' && preg_match('#^/api/admin/faculties/([^/]+)$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        dbQuery("DELETE FROM faculties WHERE id = ?", [$m[1]]);
        jsonResponse(['message' => 'Faculty deleted successfully']);
    }

    // DEPARTMENTS CRUD
    if ($method === 'POST' && $endpoint === '/api/admin/departments') {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        $body = getRequestBody();
        $name = trim($body['name'] ?? '');
        $code = trim($body['code'] ?? '');
        if (!$name) jsonError("Department name is required.");

        $newId = generateUuid();
        dbQuery("INSERT INTO departments (id, name, code) VALUES (?, ?, ?)", [$newId, $name, $code ?: null]);

        jsonResponse(dbQueryOne("SELECT * FROM departments WHERE id = ?", [$newId]), 201);
    }

    if ($method === 'PUT' && preg_match('#^/api/admin/departments/([^/]+)$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        $deptId = $m[1];
        $body = getRequestBody();
        $name = trim($body['name'] ?? '');
        $code = trim($body['code'] ?? '');

        dbQuery("UPDATE departments SET name = ?, code = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [$name, $code ?: null, $deptId]);

        jsonResponse(dbQueryOne("SELECT * FROM departments WHERE id = ?", [$deptId]));
    }

    if ($method === 'DELETE' && preg_match('#^/api/admin/departments/([^/]+)$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        dbQuery("DELETE FROM departments WHERE id = ?", [$m[1]]);
        jsonResponse(['message' => 'Department deleted successfully']);
    }

    // OFFICIAL DIRECTORY
    if ($method === 'GET' && $endpoint === '/api/admin/official-directory') {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        jsonResponse(dbQuery("SELECT o.*, g.setName, f.name as facultyName
                              FROM official_alumni_directory o
                              LEFT JOIN graduating_sets g ON o.graduatingSetId = g.id
                              LEFT JOIN faculties f ON o.facultyId = f.id
                              ORDER BY o.createdAt DESC"));
    }

    if ($method === 'POST' && $endpoint === '/api/admin/official-directory') {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        $body = getRequestBody();
        $matricNumber = strtoupper(trim($body['matricNumber'] ?? ''));
        $firstName = trim($body['firstName'] ?? '');
        $lastName = trim($body['lastName'] ?? '');
        $graduatingSetId = trim($body['graduatingSetId'] ?? '');
        $facultyId = trim($body['facultyId'] ?? '');
        $department = trim($body['department'] ?? '');

        if (!$matricNumber || !$firstName || !$lastName) {
            jsonError("Matric number, first name, and last name are required");
        }

        $newId = generateUuid();
        dbQuery("INSERT INTO official_alumni_directory (id, matricNumber, firstName, lastName, graduatingSetId, facultyId, department) VALUES (?, ?, ?, ?, ?, ?, ?)", [$newId, $matricNumber, $firstName, $lastName, $graduatingSetId, $facultyId, $department]);

        jsonResponse(dbQueryOne("SELECT * FROM official_alumni_directory WHERE id = ?", [$newId]), 201);
    }

    if ($method === 'DELETE' && preg_match('#^/api/admin/official-directory/([^/]+)$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        dbQuery("DELETE FROM official_alumni_directory WHERE id = ?", [$m[1]]);
        jsonResponse(['message' => 'Directory record deleted successfully']);
    }

    // MEMBERS ADMIN MANAGEMENT
    if ($method === 'GET' && $endpoint === '/api/admin/members') {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        $facultyId = $_GET['facultyId'] ?? null;
        $setId = $_GET['setId'] ?? null;
        $status = $_GET['status'] ?? null;
        $search = $_GET['search'] ?? null;

        $sql = "SELECT m.*, g.setName, f.name as facultyName
                FROM members m
                LEFT JOIN graduating_sets g ON m.graduatingSetId = g.id
                LEFT JOIN faculties f ON m.facultyId = f.id
                WHERE m.role NOT IN ('ADMIN', 'SUPER_ADMIN')";
        $params = [];

        if ($facultyId) {
            $sql .= " AND m.facultyId = ?";
            $params[] = $facultyId;
        }

        if ($setId) {
            $sql .= " AND m.graduatingSetId = ?";
            $params[] = $setId;
        }

        if ($status) {
            $sql .= " AND m.verificationStatus = ?";
            $params[] = $status;
        }

        if ($search) {
            $sql .= " AND (m.firstName LIKE ? OR m.lastName LIKE ? OR m.email LIKE ? OR m.department LIKE ?)";
            $st = "%{$search}%";
            $params = array_merge($params, [$st, $st, $st, $st]);
        }

        $sql .= " ORDER BY m.createdAt DESC";
        $members = dbQuery($sql, $params);
        if (is_array($members)) {
            foreach ($members as &$mem) {
                $mem['isFeatured'] = !empty($mem['isFeatured']) ? 1 : 0;
                $mem['isAlumniOfWeek'] = !empty($mem['isAlumniOfWeek']) ? 1 : 0;
            }
        }
        jsonResponse($members);
    }

    if ($method === 'PUT' && preg_match('#^/api/admin/members/([^/]+)$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        $body = getRequestBody();
        $status = trim($body['verificationStatus'] ?? $body['status'] ?? '');
        if ($status) {
            dbQuery("UPDATE members SET verificationStatus = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [$status, $m[1]]);
        }
        jsonResponse(['message' => 'Member updated successfully']);
    }

    if ($method === 'GET' && preg_match('#^/api/admin/members/([^/]+)/details$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        $memberId = $m[1];

        $memberInfo = dbQueryOne("SELECT m.*, g.setName, f.name as facultyName
                                FROM members m
                                LEFT JOIN graduating_sets g ON m.graduatingSetId = g.id
                                LEFT JOIN faculties f ON m.facultyId = f.id
                                WHERE m.id = ?", [$memberId]);
        if (!$memberInfo) jsonError("Member not found", 404);

        $payments = dbQuery("SELECT p.*, d.title as duesTitle FROM payment_records p LEFT JOIN dues_items d ON p.duesItemId = d.id WHERE p.memberId = ? ORDER BY p.createdAt DESC", [$memberId]);
        $welfare = dbQuery("SELECT * FROM welfare_requests WHERE memberId = ? ORDER BY createdAt DESC", [$memberId]);

        jsonResponse([
            'member' => $memberInfo,
            'payments' => $payments,
            'welfareRequests' => $welfare
        ]);
    }

    if ($method === 'PUT' && preg_match('#^/api/admin/members/([^/]+)/verify$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        dbQuery("UPDATE members SET verificationStatus = 'VERIFIED', updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [$m[1]]);
        jsonResponse(['message' => 'Member verified successfully']);
    }

    if ($method === 'PUT' && preg_match('#^/api/admin/members/([^/]+)/suspend$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        dbQuery("UPDATE members SET verificationStatus = 'SUSPENDED', updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [$m[1]]);
        jsonResponse(['message' => 'Member suspended successfully']);
    }

    if ($method === 'PUT' && preg_match('#^/api/admin/members/([^/]+)/alumni-of-the-week$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        $body = getRequestBody();
        $val = $body['isAlumniOfWeek'] ?? null;
        $isAlumniOfWeek = ($val === true || $val === 'true' || $val === 1 || $val === '1') ? 1 : 0;
        $bio = trim($body['alumniOfWeekBio'] ?? $body['bio'] ?? '');

        if ($isAlumniOfWeek === 1) {
            dbQuery("UPDATE members SET isAlumniOfWeek = 0");
        }

        dbQuery("UPDATE members SET isAlumniOfWeek = ?, alumniOfWeekBio = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [$isAlumniOfWeek, $bio, $m[1]]);
        cacheForget('members:alumni-of-the-week');
        jsonResponse(['message' => 'Alumni of the week updated successfully', 'isAlumniOfWeek' => $isAlumniOfWeek]);
    }

    if ($method === 'PUT' && preg_match('#^/api/admin/members/([^/]+)/featured$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        $body = getRequestBody();
        $val = $body['isFeatured'] ?? null;
        $isFeatured = ($val === true || $val === 'true' || $val === 1 || $val === '1') ? 1 : 0;

        dbQuery("UPDATE members SET isFeatured = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [$isFeatured, $m[1]]);
        cacheForget('members:featured');
        jsonResponse(['message' => 'Member featured status updated successfully', 'isFeatured' => $isFeatured]);
    }

    // LEADERSHIP / EXCOS MANAGEMENT
    if ($method === 'POST' && $endpoint === '/api/admin/leadership') {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        $body = getRequestBody();
        $name = trim($body['name'] ?? '');
        $position = trim($body['position'] ?? '');
        $biography = trim($body['biography'] ?? '');
        $photoUrl = trim($body['photoUrl'] ?? '');
        $memberId = trim($body['memberId'] ?? '');
        $termStart = intval($body['termStart'] ?? date('Y'));
        $termEnd = isset($body['termEnd']) ? intval($body['termEnd']) : null;

        if (!$name || !$position) jsonError("Name and position are required.");

        $newId = generateUuid();
        dbQuery("INSERT INTO leadership_profiles (id, name, position, biography, photoUrl, memberId, termStart, termEnd, isCurrent, orderIndex) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)", [$newId, $name, $position, $biography, $photoUrl ?: null, $memberId ?: null, $termStart, $termEnd]);

        // If elevating an existing alumni member, grant EXCO role
        if ($memberId) {
            dbQuery("UPDATE members SET role = 'EXCO_ADMIN' WHERE id = ?", [$memberId]);
        }

        cacheForget('leadership:list');
        jsonResponse(dbQueryOne("SELECT * FROM leadership_profiles WHERE id = ?", [$newId]), 201);
    }

    if ($method === 'PUT' && preg_match('#^/api/admin/leadership/([^/]+)$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        $leadId = $m[1];
        $body = getRequestBody();
        $name = trim($body['name'] ?? '');
        $position = trim($body['position'] ?? '');
        $biography = trim($body['biography'] ?? '');
        $photoUrl = trim($body['photoUrl'] ?? '');
        $termStart = isset($body['termStart']) ? intval($body['termStart']) : null;
        $termEnd = isset($body['termEnd']) ? intval($body['termEnd']) : null;

        $existing = dbQueryOne("SELECT * FROM leadership_profiles WHERE id = ?", [$leadId]);
        if (!$existing) jsonError("Leadership profile not found", 404);

        $updName = $name !== '' ? $name : $existing['name'];
        $updPos = $position !== '' ? $position : $existing['position'];
        $updBio = $biography !== '' ? $biography : $existing['biography'];
        $updPhoto = array_key_exists('photoUrl', $body) ? $photoUrl : $existing['photoUrl'];
        $updStart = $termStart !== null ? $termStart : $existing['termStart'];
        $updEnd = $termEnd !== null ? $termEnd : $existing['termEnd'];

        dbQuery("UPDATE leadership_profiles SET name = ?, position = ?, biography = ?, photoUrl = ?, termStart = ?, termEnd = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [$updName, $updPos, $updBio, $updPhoto ?: null, $updStart, $updEnd, $leadId]);

        cacheForget('leadership:list');
        jsonResponse(dbQueryOne("SELECT * FROM leadership_profiles WHERE id = ?", [$leadId]));
    }

    if ($method === 'DELETE' && preg_match('#^/api/admin/leadership/([^/]+)$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        dbQuery("DELETE FROM leadership_profiles WHERE id = ?", [$m[1]]);
        cacheForget('leadership:list');
        jsonResponse(['message' => 'Leadership profile deleted successfully']);
    }

    // IMPACT STATS
    if ($method === 'PUT' && $endpoint === '/api/admin/impact-stats') {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        $body = getRequestBody();
        $activeMembers = intval($body['activeMembers'] ?? 0);
        $totalDonations = floatval($body['totalDonations'] ?? 0);
        $projectsFunded = intval($body['projectsFunded'] ?? 0);
        $countriesCount = intval($body['countriesCount'] ?? 0);

        dbQuery("UPDATE impact_stats SET activeMembers = ?, totalDonations = ?, projectsFunded = ?, countriesCount = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = 'default-impact-stats'", [$activeMembers, $totalDonations, $projectsFunded, $countriesCount]);

        cacheForget('finance:impact-stats');
        jsonResponse(dbQueryOne("SELECT * FROM impact_stats WHERE id = 'default-impact-stats'"));
    }
}
