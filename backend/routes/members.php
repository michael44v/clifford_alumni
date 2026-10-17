<?php
// backend/routes/members.php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/auth.php';

function handleMemberRoutes(string $endpoint, string $method): void {
    if ($method === 'GET' && $endpoint === '/api/members/alumni-of-the-week') {
        $aow = dbQueryOne("SELECT m.*, g.setName, f.name as facultyName, med.secureUrl as photoUrl
                           FROM members m
                           LEFT JOIN graduating_sets g ON m.graduatingSetId = g.id
                           LEFT JOIN faculties f ON m.facultyId = f.id
                           LEFT JOIN media med ON m.profilePhotoMediaId = med.id
                           WHERE m.isAlumniOfWeek = 1 LIMIT 1");
        jsonResponse($aow ?: null);
    }

    if ($method === 'GET' && $endpoint === '/api/members/featured') {
        jsonResponse(dbQuery("SELECT m.id, m.firstName, m.lastName, m.profession, m.company, g.setName, f.name as facultyName, med.secureUrl as photoUrl
                              FROM members m
                              LEFT JOIN graduating_sets g ON m.graduatingSetId = g.id
                              LEFT JOIN faculties f ON m.facultyId = f.id
                              LEFT JOIN media med ON m.profilePhotoMediaId = med.id
                              WHERE m.isFeatured = 1 LIMIT 10"));
    }

    if ($method === 'GET' && $endpoint === '/api/members/directory') {
        $facultyId = $_GET['facultyId'] ?? null;
        $setId = $_GET['setId'] ?? null;
        $search = $_GET['search'] ?? null;

        $sql = "SELECT m.id, m.firstName, m.lastName, m.profession, m.company, m.department, m.diasporaCountry, m.diasporaCity,
                       g.setName, f.name as facultyName, med.secureUrl as photoUrl
                FROM members m
                LEFT JOIN graduating_sets g ON m.graduatingSetId = g.id
                LEFT JOIN faculties f ON m.facultyId = f.id
                LEFT JOIN media med ON m.profilePhotoMediaId = med.id
                WHERE m.verificationStatus = 'VERIFIED'";
        $params = [];

        if ($facultyId) {
            $sql .= " AND m.facultyId = ?";
            $params[] = $facultyId;
        }

        if ($setId) {
            $sql .= " AND m.graduatingSetId = ?";
            $params[] = $setId;
        }

        if ($search) {
            $sql .= " AND (m.firstName LIKE ? OR m.lastName LIKE ? OR m.profession LIKE ? OR m.company LIKE ?)";
            $searchTerm = "%{$search}%";
            $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
        }

        $sql .= " ORDER BY m.firstName ASC, m.lastName ASC";
        jsonResponse(dbQuery($sql, $params));
    }

    // Protected Member Routes
    $user = authenticateJWT();

    if ($method === 'GET' && $endpoint === '/api/members/me') {
        $member = dbQueryOne("SELECT m.*, g.setName, f.name as facultyName, med.secureUrl as profilePhotoUrl
                              FROM members m
                              LEFT JOIN graduating_sets g ON m.graduatingSetId = g.id
                              LEFT JOIN faculties f ON m.facultyId = f.id
                              LEFT JOIN media med ON m.profilePhotoMediaId = med.id
                              WHERE m.id = ?", [$user['id']]);
        if (!$member) jsonError("User not found", 404);
        unset($member['passwordHash']);
        jsonResponse($member);
    }

    if ($method === 'PUT' && ($endpoint === '/api/members/me' || $endpoint === '/api/members/profile')) {
        $body = getRequestBody();
        $firstName = trim($body['firstName'] ?? '');
        $lastName = trim($body['lastName'] ?? '');
        $phone = trim($body['phone'] ?? '');
        $profession = trim($body['profession'] ?? '');
        $company = trim($body['company'] ?? '');
        $bio = trim($body['bio'] ?? '');
        $diasporaCountry = trim($body['diasporaCountry'] ?? '');
        $diasporaCity = trim($body['diasporaCity'] ?? '');
        $profilePhotoUrl = trim($body['profilePhotoUrl'] ?? '');

        // Handle profile photo media if provided
        $mediaId = null;
        if (!empty($profilePhotoUrl) && $profilePhotoUrl !== '[File Selected]') {
            $existingMember = dbQueryOne("SELECT profilePhotoMediaId FROM members WHERE id = ?", [$user['id']]);
            if (!empty($existingMember['profilePhotoMediaId'])) {
                dbQuery("UPDATE media SET secureUrl = ? WHERE id = ?", [$profilePhotoUrl, $existingMember['profilePhotoMediaId']]);
            } else {
                $mediaId = generateUuid();
                dbQuery("INSERT INTO media (id, cloudinaryPublicId, secureUrl, resourceType, folder) VALUES (?, ?, ?, 'image', 'alumni/avatars')",
                    [$mediaId, 'avatar_' . $user['id'] . '_' . time(), $profilePhotoUrl]);
                dbQuery("UPDATE members SET profilePhotoMediaId = ? WHERE id = ?", [$mediaId, $user['id']]);
            }
        }

        dbQuery("UPDATE members SET
            firstName = COALESCE(NULLIF(?, ''), firstName),
            lastName = COALESCE(NULLIF(?, ''), lastName),
            phone = COALESCE(NULLIF(?, ''), phone),
            profession = COALESCE(NULLIF(?, ''), profession),
            company = COALESCE(NULLIF(?, ''), company),
            bio = COALESCE(NULLIF(?, ''), bio),
            diasporaCountry = COALESCE(NULLIF(?, ''), diasporaCountry),
            diasporaCity = COALESCE(NULLIF(?, ''), diasporaCity),
            updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?", [$firstName, $lastName, $phone, $profession, $company, $bio, $diasporaCountry, $diasporaCity, $user['id']]);

        $upd = dbQueryOne("SELECT m.*, g.setName, f.name as facultyName, med.secureUrl as profilePhotoUrl
                           FROM members m
                           LEFT JOIN graduating_sets g ON m.graduatingSetId = g.id
                           LEFT JOIN faculties f ON m.facultyId = f.id
                           LEFT JOIN media med ON m.profilePhotoMediaId = med.id
                           WHERE m.id = ?", [$user['id']]);
        if ($upd) {
            unset($upd['passwordHash']);
        }
        jsonResponse($upd);
    }
}
