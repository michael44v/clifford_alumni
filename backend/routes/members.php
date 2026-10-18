<?php
// backend/routes/members.php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/auth.php';

function handleMemberRoutes(string $endpoint, string $method): void {
    if ($method === 'GET' && $endpoint === '/api/members/alumni-of-the-week') {
        header('Cache-Control: no-cache, no-store, must-revalidate');
        $aow = cacheRemember('members:alumni-of-the-week', 10, function() {
            return dbQueryOne("SELECT m.*, g.setName, f.name as facultyName, med.secureUrl as photoUrl, med.secureUrl as profilePhotoUrl
                               FROM members m
                               LEFT JOIN graduating_sets g ON m.graduatingSetId = g.id
                               LEFT JOIN faculties f ON m.facultyId = f.id
                               LEFT JOIN media med ON m.profilePhotoMediaId = med.id
                               WHERE m.isAlumniOfWeek = 1 LIMIT 1");
        });
        jsonResponse($aow ?: null);
    }

    if ($method === 'GET' && $endpoint === '/api/members/featured') {
        header('Cache-Control: no-cache, no-store, must-revalidate');
        $featured = cacheRemember('members:featured', 10, function() {
            return dbQuery("SELECT m.id, m.firstName, m.lastName, m.profession, m.company, g.setName, f.name as facultyName, med.secureUrl as photoUrl, med.secureUrl as profilePhotoUrl
                            FROM members m
                            LEFT JOIN graduating_sets g ON m.graduatingSetId = g.id
                            LEFT JOIN faculties f ON m.facultyId = f.id
                            LEFT JOIN media med ON m.profilePhotoMediaId = med.id
                            WHERE m.isFeatured = 1 LIMIT 10");
        });
        jsonResponse($featured);
    }

    if ($method === 'GET' && $endpoint === '/api/members/directory') {
        $facultyId = $_GET['facultyId'] ?? null;
        $setId = $_GET['setId'] ?? null;
        $department = $_GET['department'] ?? null;
        $search = $_GET['search'] ?? null;
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 12;
        $offset = ($page - 1) * $limit;

        $where = ["m.verificationStatus = 'VERIFIED'", "m.role NOT IN ('ADMIN', 'SUPER_ADMIN')"];
        $params = [];

        if ($facultyId && $facultyId !== 'ALL') {
            $where[] = "m.facultyId = ?";
            $params[] = $facultyId;
        }

        if ($setId && $setId !== 'ALL') {
            $where[] = "m.graduatingSetId = ?";
            $params[] = $setId;
        }

        if ($department && $department !== 'ALL') {
            $where[] = "m.department = ?";
            $params[] = $department;
        }

        if ($search && trim($search) !== '') {
            $where[] = "(m.firstName LIKE ? OR m.lastName LIKE ? OR m.profession LIKE ? OR m.company LIKE ? OR m.department LIKE ?)";
            $searchTerm = "%" . trim($search) . "%";
            $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm]);
        }

        $whereSql = implode(" AND ", $where);

        $countRow = dbQueryOne("SELECT COUNT(*) as total FROM members m WHERE {$whereSql}", $params);
        $total = intval($countRow['total'] ?? 0);
        $totalPages = max(1, ceil($total / $limit));

        $sql = "SELECT m.id, m.firstName, m.lastName, m.profession, m.company, m.department, m.diasporaCountry, m.diasporaCity,
                       g.setName, g.graduationYear, f.name as facultyName, med.secureUrl as photoUrl
                FROM members m
                LEFT JOIN graduating_sets g ON m.graduatingSetId = g.id
                LEFT JOIN faculties f ON m.facultyId = f.id
                LEFT JOIN media med ON m.profilePhotoMediaId = med.id
                WHERE {$whereSql}
                ORDER BY m.firstName ASC, m.lastName ASC
                LIMIT {$limit} OFFSET {$offset}";

        $members = dbQuery($sql, $params);

        jsonResponse([
            'data' => $members,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'totalPages' => $totalPages
            ]
        ]);
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
        $phone = trim($body['phone'] ?? '');
        $profession = trim($body['profession'] ?? '');
        $company = trim($body['company'] ?? '');
        $bio = trim($body['bio'] ?? '');
        $diasporaCountry = trim($body['diasporaCountry'] ?? '');
        $diasporaCity = trim($body['diasporaCity'] ?? '');
        $profilePhotoUrl = trim($body['profilePhotoUrl'] ?? '');
        $department = trim($body['department'] ?? '');
        $graduatingSetId = trim($body['gradSet'] ?? $body['graduatingSetId'] ?? '');
        $facultyId = trim($body['faculty'] ?? $body['facultyId'] ?? '');

        // Resolve graduatingSetId / facultyId if provided as names
        if ($graduatingSetId && !preg_match('/^[a-f0-9-]{36}$/i', $graduatingSetId)) {
            $sRow = dbQueryOne("SELECT id FROM graduating_sets WHERE LOWER(setName) = LOWER(?) OR id = ?", [$graduatingSetId, $graduatingSetId]);
            if ($sRow) $graduatingSetId = $sRow['id'];
        }
        if ($facultyId && !preg_match('/^[a-f0-9-]{36}$/i', $facultyId)) {
            $fRow = dbQueryOne("SELECT id FROM faculties WHERE LOWER(name) = LOWER(?) OR id = ?", [$facultyId, $facultyId]);
            if ($fRow) $facultyId = $fRow['id'];
        }

        // Handle profile photo media if provided
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
            phone = COALESCE(NULLIF(?, ''), phone),
            profession = COALESCE(NULLIF(?, ''), profession),
            company = COALESCE(NULLIF(?, ''), company),
            bio = COALESCE(NULLIF(?, ''), bio),
            diasporaCountry = COALESCE(NULLIF(?, ''), diasporaCountry),
            diasporaCity = COALESCE(NULLIF(?, ''), diasporaCity),
            department = COALESCE(NULLIF(?, ''), department),
            graduatingSetId = COALESCE(NULLIF(?, ''), graduatingSetId),
            facultyId = COALESCE(NULLIF(?, ''), facultyId),
            updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?", [$phone, $profession, $company, $bio, $diasporaCountry, $diasporaCity, $department, $graduatingSetId, $facultyId, $user['id']]);

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
