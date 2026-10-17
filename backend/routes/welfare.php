<?php
// backend/routes/welfare.php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/auth.php';

function handleWelfareRoutes(string $endpoint, string $method): void {
    $user = authenticateJWT();

    if ($method === 'GET' && ($endpoint === '/api/welfare' || $endpoint === '/api/welfare/requests' || $endpoint === '/api/welfare/my-requests' || $endpoint === '/api/welfare/admin/cases')) {
        if ($endpoint === '/api/welfare/my-requests') {
            jsonResponse(dbQuery("SELECT * FROM welfare_requests WHERE memberId = ? ORDER BY createdAt DESC", [$user['id']]));
        } else if (($endpoint === '/api/welfare/requests' || $endpoint === '/api/welfare/admin/cases') && in_array($user['role'], ['ADMIN', 'SUPER_ADMIN', 'WELFARE_ADMIN'])) {
            jsonResponse(dbQuery("SELECT w.*, m.firstName, m.lastName, m.email, m.phone
                                  FROM welfare_requests w
                                  JOIN members m ON w.memberId = m.id
                                  ORDER BY w.createdAt DESC"));
        } else {
            jsonResponse(dbQuery("SELECT * FROM welfare_requests WHERE memberId = ? ORDER BY createdAt DESC", [$user['id']]));
        }
    }

    if ($method === 'POST' && ($endpoint === '/api/welfare' || $endpoint === '/api/welfare/requests')) {
        $body = getRequestBody();
        $category = trim($body['category'] ?? 'OTHER');
        $urgency = trim($body['urgency'] ?? 'MEDIUM');
        $description = trim($body['description'] ?? '');

        if (strlen($description) < 10) {
            jsonError("Description must be at least 10 characters");
        }

        $newId = generateUuid();
        dbQuery("INSERT INTO welfare_requests (id, memberId, category, urgency, description, status) VALUES (?, ?, ?, ?, ?, 'NEW')", [$newId, $user['id'], $category, $urgency, $description]);

        jsonResponse(dbQueryOne("SELECT * FROM welfare_requests WHERE id = ?", [$newId]), 201);
    }

    if ($method === 'PUT' && (preg_match('#^/api/welfare/requests/([^/]+)/status$#', $endpoint, $m) || preg_match('#^/api/welfare/admin/cases/([^/]+)$#', $endpoint, $m))) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN', 'WELFARE_ADMIN']);
        $reqId = $m[1];
        $body = getRequestBody();
        $status = trim($body['status'] ?? '');
        $internalNotes = trim($body['internalNotes'] ?? '');

        if (!$status) jsonError("Status required");

        dbQuery("UPDATE welfare_requests SET status = ?, internalNotes = COALESCE(NULLIF(?, ''), internalNotes), updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [$status, $internalNotes, $reqId]);

        jsonResponse(dbQueryOne("SELECT * FROM welfare_requests WHERE id = ?", [$reqId]));
    }
}
