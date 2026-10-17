<?php
// backend/routes/auth.php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/jwt.php';
require_once __DIR__ . '/../utils/cloudinary.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/auth.php';

function handleAuthRoutes(string $endpoint, string $method): void {
    if ($method === 'POST' && $endpoint === '/api/auth/verify-matric') {
        $body = getRequestBody();
        $matricNumber = trim($body['matricNumber'] ?? '');
        if (!$matricNumber) {
            jsonError("Matriculation number is required.");
        }

        $entry = dbQueryOne("SELECT o.*, g.setName as gradSetName, f.name as facultyName
                             FROM official_alumni_directory o
                             LEFT JOIN graduating_sets g ON o.graduatingSetId = g.id
                             LEFT JOIN faculties f ON o.facultyId = f.id
                             WHERE UPPER(o.matricNumber) = UPPER(?)", [$matricNumber]);

        if (!$entry) {
            jsonResponse([
                'valid' => false,
                'error' => 'Matriculation number not found in the official alumni directory. Please check your matric number or apply for Associate Membership.'
            ], 404);
        }

        jsonResponse(['valid' => true, 'entry' => $entry]);
    }

    if ($method === 'POST' && $endpoint === '/api/auth/register/alumni') {
        $body = getRequestBody();
        $matricNumber = strtoupper(trim($body['matricNumber'] ?? ''));
        $email = trim(strtolower($body['email'] ?? ''));
        $password = $body['password'] ?? '';
        $firstName = trim($body['firstName'] ?? '');
        $lastName = trim($body['lastName'] ?? '');
        $phone = trim($body['phone'] ?? '');
        $department = trim($body['department'] ?? '');
        $profession = trim($body['profession'] ?? '');
        $gradSet = trim($body['gradSet'] ?? '');
        $faculty = trim($body['faculty'] ?? '');

        if (!$email || !$password || strlen($password) < 8 || !$firstName || !$lastName) {
            jsonError("Required registration fields missing or password too short (min 8 chars)");
        }

        // Check duplicate
        $existing = dbQueryOne("SELECT id FROM members WHERE email = ? OR (matricNumber IS NOT NULL AND matricNumber = ?)", [$email, $matricNumber]);
        if ($existing) {
            jsonError("An account with this email or matriculation number already exists.");
        }

        $graduatingSetId = null;
        if ($gradSet) {
            $sRow = dbQueryOne("SELECT id FROM graduating_sets WHERE LOWER(setName) = LOWER(?) OR id = ?", [$gradSet, $gradSet]);
            if ($sRow) $graduatingSetId = $sRow['id'];
        }

        $facultyId = null;
        if ($faculty) {
            $fRow = dbQueryOne("SELECT id FROM faculties WHERE LOWER(name) = LOWER(?) OR id = ?", [$faculty, $faculty]);
            if ($fRow) $facultyId = $fRow['id'];
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $newId = generateUuid();

        // ALUMNI are automatically VERIFIED
        dbQuery("INSERT INTO members
            (id, email, passwordHash, matricNumber, firstName, lastName, phone, department, profession, graduatingSetId, facultyId, memberType, verificationStatus)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ALUMNI', 'VERIFIED')",
            [$newId, $email, $passwordHash, $matricNumber, $firstName, $lastName, $phone, $department, $profession, $graduatingSetId, $facultyId]);

        $tokenPayload = [
            'userId' => $newId,
            'role' => 'MEMBER',
            'memberType' => 'ALUMNI',
            'verificationStatus' => 'VERIFIED'
        ];

        $accessToken = generateAccessToken($tokenPayload);
        $ref = generateRefreshToken($tokenPayload);

        dbQuery("INSERT INTO refresh_tokens (id, memberId, hashedToken, expiresAt) VALUES (?, ?, ?, ?)",
            [generateUuid(), $newId, $ref['hash'], date('Y-m-d H:i:s', time() + 7 * 86400)]);

        setcookie("refreshToken", $ref['token'], [
            'expires' => time() + 7 * 86400,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        jsonResponse([
            'message' => 'Registration successful',
            'accessToken' => $accessToken,
            'member' => [
                'id' => $newId,
                'email' => $email,
                'firstName' => $firstName,
                'lastName' => $lastName,
                'role' => 'MEMBER',
                'memberType' => 'ALUMNI',
                'verificationStatus' => 'VERIFIED'
            ]
        ], 201);
    }

    if ($method === 'POST' && $endpoint === '/api/auth/register/associate') {
        $body = getRequestBody();
        $email = trim(strtolower($body['email'] ?? ''));
        $password = $body['password'] ?? '';
        $firstName = trim($body['firstName'] ?? '');
        $lastName = trim($body['lastName'] ?? '');
        $phone = trim($body['phone'] ?? '');
        $profession = trim($body['profession'] ?? '');

        if (!$email || !$password || strlen($password) < 8 || !$firstName || !$lastName) {
            jsonError("Required registration fields missing");
        }

        $existing = dbQueryOne("SELECT id FROM members WHERE email = ?", [$email]);
        if ($existing) {
            jsonError("An account with this email already exists.");
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $newId = generateUuid();

        dbQuery("INSERT INTO members
            (id, email, passwordHash, firstName, lastName, phone, profession, memberType, verificationStatus)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'ASSOCIATE', 'PENDING')",
            [$newId, $email, $passwordHash, $firstName, $lastName, $phone, $profession]);

        $tokenPayload = [
            'userId' => $newId,
            'role' => 'MEMBER',
            'memberType' => 'ASSOCIATE',
            'verificationStatus' => 'PENDING'
        ];

        $accessToken = generateAccessToken($tokenPayload);
        $ref = generateRefreshToken($tokenPayload);

        dbQuery("INSERT INTO refresh_tokens (id, memberId, hashedToken, expiresAt) VALUES (?, ?, ?, ?)",
            [generateUuid(), $newId, $ref['hash'], date('Y-m-d H:i:s', time() + 7 * 86400)]);

        setcookie("refreshToken", $ref['token'], [
            'expires' => time() + 7 * 86400,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        jsonResponse([
            'message' => 'Associate registration submitted.',
            'accessToken' => $accessToken,
            'member' => [
                'id' => $newId,
                'email' => $email,
                'firstName' => $firstName,
                'lastName' => $lastName,
                'role' => 'MEMBER',
                'memberType' => 'ASSOCIATE',
                'verificationStatus' => 'PENDING'
            ]
        ], 201);
    }

    if ($method === 'POST' && $endpoint === '/api/auth/login') {
        $body = getRequestBody();
        $email = trim(strtolower($body['email'] ?? ''));
        $password = $body['password'] ?? '';

        $member = dbQueryOne("SELECT * FROM members WHERE email = ?", [$email]);

        if (!$member || !password_verify($password, $member['passwordHash'])) {
            jsonError("Invalid credentials");
        }

        if ($member['verificationStatus'] === 'SUSPENDED' || $member['verificationStatus'] === 'INACTIVE') {
            jsonError("Your account is currently inactive or suspended.", 403);
        }

        $tokenPayload = [
            'userId' => $member['id'],
            'role' => $member['role'],
            'memberType' => $member['memberType'],
            'verificationStatus' => $member['verificationStatus']
        ];

        $accessToken = generateAccessToken($tokenPayload);
        $ref = generateRefreshToken($tokenPayload);

        dbQuery("INSERT INTO refresh_tokens (id, memberId, hashedToken, expiresAt) VALUES (?, ?, ?, ?)",
            [generateUuid(), $member['id'], $ref['hash'], date('Y-m-d H:i:s', time() + 7 * 86400)]);

        setcookie("refreshToken", $ref['token'], [
            'expires' => time() + 7 * 86400,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        jsonResponse([
            'accessToken' => $accessToken,
            'member' => [
                'id' => $member['id'],
                'email' => $member['email'],
                'firstName' => $member['firstName'],
                'lastName' => $member['lastName'],
                'role' => $member['role'],
                'memberType' => $member['memberType'],
                'verificationStatus' => $member['verificationStatus']
            ]
        ]);
    }

    if ($method === 'POST' && $endpoint === '/api/auth/refresh') {
        $refreshToken = $_COOKIE['refreshToken'] ?? '';
        if (!$refreshToken) {
            jsonError("Refresh token missing", 401);
        }

        $tokenHash = hashToken($refreshToken);
        $savedToken = dbQueryOne("SELECT r.*, m.id as mId, m.role, m.memberType, m.verificationStatus
                                  FROM refresh_tokens r
                                  JOIN members m ON r.memberId = m.id
                                  WHERE r.hashedToken = ?", [$tokenHash]);

        if (!$savedToken || $savedToken['isRevoked'] || strtotime($savedToken['expiresAt']) < time()) {
            setcookie("refreshToken", "", time() - 3600, "/");
            jsonError("Invalid or expired refresh token", 401);
        }

        // Revoke token
        dbQuery("UPDATE refresh_tokens SET isRevoked = 1 WHERE id = ?", [$savedToken['id']]);

        $tokenPayload = [
            'userId' => $savedToken['mId'],
            'role' => $savedToken['role'],
            'memberType' => $savedToken['memberType'],
            'verificationStatus' => $savedToken['verificationStatus']
        ];

        $newAccessToken = generateAccessToken($tokenPayload);
        $ref = generateRefreshToken($tokenPayload);

        dbQuery("INSERT INTO refresh_tokens (id, memberId, hashedToken, expiresAt) VALUES (?, ?, ?, ?)",
            [generateUuid(), $savedToken['mId'], $ref['hash'], date('Y-m-d H:i:s', time() + 7 * 86400)]);

        setcookie("refreshToken", $ref['token'], [
            'expires' => time() + 7 * 86400,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        jsonResponse(['accessToken' => $newAccessToken]);
    }

    if ($method === 'POST' && $endpoint === '/api/auth/logout') {
        $refreshToken = $_COOKIE['refreshToken'] ?? '';
        if ($refreshToken) {
            $tokenHash = hashToken($refreshToken);
            dbQuery("UPDATE refresh_tokens SET isRevoked = 1 WHERE hashedToken = ?", [$tokenHash]);
        }
        setcookie("refreshToken", "", time() - 3600, "/");
        jsonResponse(['message' => 'Logged out successfully']);
    }

    if ($method === 'GET' && $endpoint === '/api/auth/cloudinary-signature') {
        authenticateJWT();
        $folder = $_GET['folder'] ?? 'alumni/uploads';
        jsonResponse(generateUploadSignature($folder));
    }
}
