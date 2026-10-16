<?php
// backend/routes/business.php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/auth.php';

function handleBusinessRoutes(string $endpoint, string $method): void {
    if ($method === 'GET' && $endpoint === '/api/business') {
        $category = $_GET['category'] ?? null;
        $search = $_GET['search'] ?? null;

        $sql = "SELECT b.*, m.firstName, m.lastName, ml.secureUrl as logoUrl, mb.secureUrl as bannerUrl
                FROM business_listings b
                JOIN members m ON b.memberId = m.id
                LEFT JOIN media ml ON b.logoMediaId = ml.id
                LEFT JOIN media mb ON b.bannerMediaId = mb.id
                WHERE b.status = 'APPROVED'";
        $params = [];

        if ($category && $category !== 'All') {
            $sql .= " AND b.category = ?";
            $params[] = $category;
        }

        if ($search) {
            $sql .= " AND (b.businessName LIKE ? OR b.description LIKE ? OR b.services LIKE ?)";
            $st = "%{$search}%";
            $params = array_merge($params, [$st, $st, $st]);
        }

        $sql .= " ORDER BY b.createdAt DESC";
        jsonResponse(dbQuery($sql, $params));
    }

    $user = authenticateJWT();

    if ($method === 'POST' && $endpoint === '/api/business') {
        $body = getRequestBody();
        $businessName = trim($body['businessName'] ?? '');
        $category = trim($body['category'] ?? '');
        $industry = trim($body['industry'] ?? '');
        $description = trim($body['description'] ?? '');
        $services = trim($body['services'] ?? '');
        $phone = trim($body['phone'] ?? '');
        $email = trim($body['email'] ?? '');
        $website = trim($body['website'] ?? '');
        $address = trim($body['address'] ?? '');

        if (!$businessName || !$category || !$description) {
            jsonError("Business name, category, and description are required");
        }

        $newId = generateUuid();
        dbQuery("INSERT INTO business_listings
            (id, memberId, businessName, category, industry, description, services, phone, email, website, address, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')",
            [$newId, $user['id'], $businessName, $category, $industry, $description, $services, $phone, $email, $website, $address]);

        jsonResponse(dbQueryOne("SELECT * FROM business_listings WHERE id = ?", [$newId]), 201);
    }

    if ($method === 'PUT' && preg_match('#^/api/business/([^/]+)/status$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN', 'MODERATOR']);
        $body = getRequestBody();
        $status = trim($body['status'] ?? 'APPROVED');
        $rejectionReason = trim($body['rejectionReason'] ?? '');

        dbQuery("UPDATE business_listings SET status = ?, rejectionReason = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [$status, $rejectionReason, $m[1]]);

        jsonResponse(['message' => 'Listing status updated']);
    }
}
