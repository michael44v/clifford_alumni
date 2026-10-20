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
        jsonResponse(dbQuery("SELECT * FROM leadership_profiles ORDER BY orderIndex ASC, termStart DESC"));
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
        jsonResponse(dbQuery("SELECT m.*, g.setName, f.name as facultyName
                              FROM members m
                              LEFT JOIN graduating_sets g ON m.graduatingSetId = g.id
                              LEFT JOIN faculties f ON m.facultyId = f.id
                              WHERE m.role NOT IN ('ADMIN', 'SUPER_ADMIN')
                              ORDER BY m.createdAt DESC"));
    }

    if ($method === 'PUT' && preg_match('#^/api/admin/members/([^/]+)$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        $memberId = $m[1];
        $body = getRequestBody();

        $existing = dbQueryOne("SELECT * FROM members WHERE id = ?", [$memberId]);
        if (!$existing) jsonError("Member not found", 404);

        $verificationStatus = $body['verificationStatus'] ?? $existing['verificationStatus'];
        $role = $body['role'] ?? $existing['role'];
        $isFeatured = isset($body['isFeatured']) ? ($body['isFeatured'] ? 1 : 0) : $existing['isFeatured'];

        dbQuery("UPDATE members SET verificationStatus = ?, role = ?, isFeatured = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
            [$verificationStatus, $role, $isFeatured, $memberId]);

        jsonResponse(dbQueryOne("SELECT m.*, g.setName, f.name as facultyName FROM members m LEFT JOIN graduating_sets g ON m.graduatingSetId = g.id LEFT JOIN faculties f ON m.facultyId = f.id WHERE m.id = ?", [$memberId]));
    }

    if ($method === 'GET' && preg_match('#^/api/admin/members/([^/]+)/details$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        $memberId = $m[1];

        $memberInfo = dbQueryOne("SELECT m.*, g.setName, g.graduationYear, f.name as facultyName
                                FROM members m
                                LEFT JOIN graduating_sets g ON m.graduatingSetId = g.id
                                LEFT JOIN faculties f ON m.facultyId = f.id
                                WHERE m.id = ?", [$memberId]);
        if (!$memberInfo) jsonError("Member not found", 404);

        $payments = dbQuery("SELECT p.*, d.title as duesTitle FROM payment_records p LEFT JOIN dues_items d ON p.duesItemId = d.id WHERE p.memberId = ? ORDER BY p.createdAt DESC", [$memberId]);
        $welfare = dbQuery("SELECT * FROM welfare_requests WHERE memberId = ? ORDER BY createdAt DESC", [$memberId]);
        $galleryPhotos = dbQuery("SELECT gp.*, a.title as albumTitle FROM gallery_photos gp LEFT JOIN gallery_albums a ON gp.albumId = a.id WHERE gp.uploadedById = ? ORDER BY gp.createdAt DESC", [$memberId]);

        $memberInfo['graduatingSet'] = [
            'setName' => $memberInfo['setName'] ?? null,
            'graduationYear' => $memberInfo['graduationYear'] ?? null
        ];
        $memberInfo['faculty'] = [
            'name' => $memberInfo['facultyName'] ?? null
        ];
        $memberInfo['paymentRecords'] = $payments;
        $memberInfo['welfareRequests'] = $welfare;
        $memberInfo['galleryPhotosUploaded'] = $galleryPhotos;

        jsonResponse($memberInfo);
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
        $isAlumniOfWeek = !empty($body['isAlumniOfWeek']) ? 1 : 0;
        $bio = trim($body['bio'] ?? '');

        if ($isAlumniOfWeek) {
            dbQuery("UPDATE members SET isAlumniOfWeek = 0");
        }

        dbQuery("UPDATE members SET isAlumniOfWeek = ?, alumniOfWeekBio = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [$isAlumniOfWeek, $bio, $m[1]]);
        jsonResponse(['message' => 'Alumni of the week updated successfully']);
    }

    if ($method === 'PUT' && preg_match('#^/api/admin/members/([^/]+)/featured$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        $body = getRequestBody();
        $isFeatured = !empty($body['isFeatured']) ? 1 : 0;

        dbQuery("UPDATE members SET isFeatured = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [$isFeatured, $m[1]]);
        jsonResponse(['message' => 'Member featured status updated successfully']);
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

        jsonResponse(dbQueryOne("SELECT * FROM leadership_profiles WHERE id = ?", [$leadId]));
    }

    if ($method === 'DELETE' && preg_match('#^/api/admin/leadership/([^/]+)$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN']);
        dbQuery("DELETE FROM leadership_profiles WHERE id = ?", [$m[1]]);
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

        jsonResponse(dbQueryOne("SELECT * FROM impact_stats WHERE id = 'default-impact-stats'"));
    }
}
