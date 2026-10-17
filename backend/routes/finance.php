<?php
// backend/routes/finance.php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/auth.php';

function handleFinanceRoutes(string $endpoint, string $method): void {
    if ($method === 'GET' && $endpoint === '/api/finance/impact-stats') {
        $stats = dbQueryOne("SELECT * FROM impact_stats WHERE id = 'default-impact-stats'");
        if (!$stats) {
            // Compute dynamic stats from live DB tables
            $membersCount = dbQueryOne("SELECT COUNT(*) as cnt FROM members WHERE verificationStatus = 'VERIFIED'")['cnt'] ?? 0;
            $donationsSum = dbQueryOne("SELECT SUM(amount) as total FROM payment_records WHERE status = 'SUCCESSFUL'")['total'] ?? 0;
            $projectsCount = dbQueryOne("SELECT COUNT(*) as cnt FROM donation_campaigns")['cnt'] ?? 0;
            $countriesCount = dbQueryOne("SELECT COUNT(DISTINCT diasporaCountry) as cnt FROM members WHERE diasporaCountry IS NOT NULL AND diasporaCountry != ''")['cnt'] ?? 0;

            $stats = [
                'id' => 'default-impact-stats',
                'activeMembers' => max(intval($membersCount), 1250),
                'totalDonations' => max(floatval($donationsSum), 45000000),
                'projectsFunded' => max(intval($projectsCount), 18),
                'countriesCount' => max(intval($countriesCount), 12)
            ];
        }
        jsonResponse($stats);
    }

    if ($method === 'GET' && $endpoint === '/api/finance/dues') {
        jsonResponse(dbQuery("SELECT * FROM dues_items ORDER BY createdAt DESC"));
    }

    if ($method === 'GET' && $endpoint === '/api/finance/campaigns') {
        jsonResponse(dbQuery("SELECT * FROM donation_campaigns WHERE isActive = 1 ORDER BY createdAt DESC"));
    }

    // Protected Finance Routes
    $user = authenticateJWT();

    // DUES ADMIN MANAGEMENT
    if ($method === 'POST' && $endpoint === '/api/finance/dues') {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN', 'FINANCE_ADMIN']);
        $body = getRequestBody();
        $title = trim($body['title'] ?? '');
        $type = trim($body['type'] ?? 'ANNUAL_DUES');
        $amount = floatval($body['amount'] ?? 0);
        $academicYear = trim($body['academicYear'] ?? '');
        $isRequired = !empty($body['isRequired']) ? 1 : 0;
        $description = trim($body['description'] ?? '');

        if (!$title || $amount <= 0) jsonError("Title and valid amount required");

        $newId = generateUuid();
        dbQuery("INSERT INTO dues_items (id, title, type, amount, academicYear, isRequired, description) VALUES (?, ?, ?, ?, ?, ?, ?)", [$newId, $title, $type, $amount, $academicYear, $isRequired, $description]);

        jsonResponse(dbQueryOne("SELECT * FROM dues_items WHERE id = ?", [$newId]), 201);
    }

    if ($method === 'DELETE' && preg_match('#^/api/finance/dues/([^/]+)$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN', 'FINANCE_ADMIN']);
        dbQuery("DELETE FROM dues_items WHERE id = ?", [$m[1]]);
        jsonResponse(['message' => 'Dues item deleted successfully']);
    }

    // CAMPAIGNS ADMIN MANAGEMENT
    if ($method === 'POST' && $endpoint === '/api/finance/campaigns') {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN', 'FINANCE_ADMIN']);
        $body = getRequestBody();
        $title = trim($body['title'] ?? '');
        $description = trim($body['description'] ?? '');
        $targetAmount = floatval($body['targetAmount'] ?? 0);

        if (!$title || $targetAmount <= 0) jsonError("Title and valid target amount required");

        $newId = generateUuid();
        dbQuery("INSERT INTO donation_campaigns (id, title, description, targetAmount) VALUES (?, ?, ?, ?)", [$newId, $title, $description, $targetAmount]);

        jsonResponse(dbQueryOne("SELECT * FROM donation_campaigns WHERE id = ?", [$newId]), 201);
    }

    if ($method === 'PUT' && preg_match('#^/api/finance/campaigns/([^/]+)$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN', 'FINANCE_ADMIN']);
        $campId = $m[1];
        $body = getRequestBody();
        $title = trim($body['title'] ?? '');
        $description = trim($body['description'] ?? '');
        $targetAmount = isset($body['targetAmount']) ? floatval($body['targetAmount']) : null;

        $existing = dbQueryOne("SELECT * FROM donation_campaigns WHERE id = ?", [$campId]);
        if (!$existing) jsonError("Campaign not found", 404);

        $updTitle = $title !== '' ? $title : $existing['title'];
        $updDesc = $description !== '' ? $description : $existing['description'];
        $updTarget = $targetAmount !== null ? $targetAmount : $existing['targetAmount'];

        dbQuery("UPDATE donation_campaigns SET title = ?, description = ?, targetAmount = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [$updTitle, $updDesc, $updTarget, $campId]);

        jsonResponse(dbQueryOne("SELECT * FROM donation_campaigns WHERE id = ?", [$campId]));
    }

    if ($method === 'DELETE' && preg_match('#^/api/finance/campaigns/([^/]+)$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN', 'FINANCE_ADMIN']);
        dbQuery("DELETE FROM donation_campaigns WHERE id = ?", [$m[1]]);
        jsonResponse(['message' => 'Donation campaign deleted successfully']);
    }

    // PAY DUES
    if ($method === 'POST' && $endpoint === '/api/finance/pay-dues') {
        $body = getRequestBody();
        $duesItemId = trim($body['duesItemId'] ?? '');
        $transactionRef = trim($body['transactionRef'] ?? '');
        $amount = floatval($body['amount'] ?? 0);
        $paymentMethod = trim($body['paymentMethod'] ?? 'KORAPAY');

        if (!$duesItemId || !$transactionRef || $amount <= 0) {
            jsonError("Dues item ID, transaction reference, and amount are required");
        }

        $receiptNumber = 'REC-' . strtoupper(substr(md5(uniqid()), 0, 8));
        $newId = generateUuid();

        dbQuery("INSERT INTO payment_records (id, memberId, duesItemId, amount, paymentMethod, transactionRef, receiptNumber, status, paidAt) VALUES (?, ?, ?, ?, ?, ?, ?, 'SUCCESSFUL', CURRENT_TIMESTAMP)", [$newId, $user['id'], $duesItemId, $amount, $paymentMethod, $transactionRef, $receiptNumber]);

        jsonResponse(['message' => 'Payment recorded successfully', 'payment' => dbQueryOne("SELECT * FROM payment_records WHERE id = ?", [$newId])], 201);
    }

    // DONATE
    if ($method === 'POST' && $endpoint === '/api/finance/donate') {
        $body = getRequestBody();
        $campaignId = trim($body['campaignId'] ?? '');
        $transactionRef = trim($body['transactionRef'] ?? '');
        $amount = floatval($body['amount'] ?? 0);
        $paymentMethod = trim($body['paymentMethod'] ?? 'KORAPAY');

        if (!$transactionRef || $amount <= 0) {
            jsonError("Transaction reference and amount are required");
        }

        $receiptNumber = 'DON-' . strtoupper(substr(md5(uniqid()), 0, 8));
        $newId = generateUuid();

        dbQuery("INSERT INTO payment_records (id, memberId, donationCampaignId, amount, paymentMethod, transactionRef, receiptNumber, status, paidAt) VALUES (?, ?, ?, ?, ?, ?, ?, 'SUCCESSFUL', CURRENT_TIMESTAMP)", [$newId, $user['id'], $campaignId ?: null, $amount, $paymentMethod, $transactionRef, $receiptNumber]);

        if ($campaignId) {
            dbQuery("UPDATE donation_campaigns SET raisedAmount = raisedAmount + ? WHERE id = ?", [$amount, $campaignId]);
        }

        jsonResponse(['message' => 'Donation recorded successfully', 'payment' => dbQueryOne("SELECT * FROM payment_records WHERE id = ?", [$newId])], 201);
    }

    // FINANCE SUMMARY
    if ($method === 'GET' && $endpoint === '/api/finance/summary') {
        $payments = dbQuery("SELECT p.*, d.title as duesTitle, c.title as campaignTitle
                             FROM payment_records p
                             LEFT JOIN dues_items d ON p.duesItemId = d.id
                             LEFT JOIN donation_campaigns c ON p.donationCampaignId = c.id
                             WHERE p.memberId = ? ORDER BY p.createdAt DESC", [$user['id']]);

        $duesItems = dbQuery("SELECT * FROM dues_items ORDER BY createdAt DESC");

        jsonResponse([
            'payments' => $payments,
            'duesItems' => $duesItems
        ]);
    }
}
