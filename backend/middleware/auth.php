<?php
// backend/middleware/auth.php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/jwt.php';
require_once __DIR__ . '/../utils/response.php';

function authenticateJWT(): array {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        jsonError("Unauthorized: Missing or invalid authorization token", 401);
    }

    $jwt = $matches[1];
    $payload = verifyJWT($jwt);

    if (!$payload || !isset($payload['userId'])) {
        jsonError("Unauthorized: Invalid or expired access token", 401);
    }

    $user = dbQueryOne("SELECT id, email, firstName, lastName, role, memberType, verificationStatus FROM members WHERE id = ?", [$payload['userId']]);

    if (!$user) {
        jsonError("Unauthorized: User not found", 401);
    }

    if ($user['verificationStatus'] === 'SUSPENDED' || $user['verificationStatus'] === 'INACTIVE') {
        jsonError("Your account is currently inactive or suspended.", 403);
    }

    return $user;
}

function requireRole(array $user, array $allowedRoles): void {
    if (!in_array($user['role'], $allowedRoles) && $user['role'] !== 'SUPER_ADMIN' && $user['role'] !== 'ADMIN') {
        jsonError("Forbidden: Insufficient privileges", 403);
    }
}
