<?php
// backend/index.php

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/utils/response.php';

require_once __DIR__ . '/routes/auth.php';
require_once __DIR__ . '/routes/admin.php';
require_once __DIR__ . '/routes/members.php';
require_once __DIR__ . '/routes/events.php';
require_once __DIR__ . '/routes/news.php';
require_once __DIR__ . '/routes/gallery.php';
require_once __DIR__ . '/routes/finance.php';
require_once __DIR__ . '/routes/welfare.php';
require_once __DIR__ . '/routes/community.php';
require_once __DIR__ . '/routes/business.php';

// Parse Request URI
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Standardize route path
$endpoint = rtrim($requestUri, '/');
if ($endpoint === '') {
    $endpoint = '/';
}

// Global Exception Handler wrapper
try {
    // Health Check
    if ($endpoint === '/api/health') {
        jsonResponse([
            'status' => 'ok',
            'service' => 'Clifford University Alumni Association PHP API',
            'timestamp' => date('c'),
            'database' => 'connected'
        ]);
    }

    // Auth Routes
    if (strpos($endpoint, '/api/auth') === 0) {
        handleAuthRoutes($endpoint, $method);
    }

    // Admin Routes
    if (strpos($endpoint, '/api/admin') === 0) {
        handleAdminRoutes($endpoint, $method);
    }

    // Member Routes
    if (strpos($endpoint, '/api/members') === 0) {
        handleMemberRoutes($endpoint, $method);
    }

    // Event Routes
    if (strpos($endpoint, '/api/events') === 0) {
        handleEventRoutes($endpoint, $method);
    }

    // News Routes
    if (strpos($endpoint, '/api/news') === 0) {
        handleNewsRoutes($endpoint, $method);
    }

    // Gallery Routes
    if (strpos($endpoint, '/api/gallery') === 0) {
        handleGalleryRoutes($endpoint, $method);
    }

    // Finance Routes
    if (strpos($endpoint, '/api/finance') === 0) {
        handleFinanceRoutes($endpoint, $method);
    }

    // Welfare Routes
    if (strpos($endpoint, '/api/welfare') === 0) {
        handleWelfareRoutes($endpoint, $method);
    }

    // Community Routes
    if (strpos($endpoint, '/api/community') === 0) {
        handleCommunityRoutes($endpoint, $method);
    }

    // Business Routes
    if (strpos($endpoint, '/api/business') === 0) {
        handleBusinessRoutes($endpoint, $method);
    }

    // Fallback 404 for unknown endpoints
    jsonError("Route not found: {$method} {$endpoint}", 404);

} catch (Throwable $e) {
    error_log("Backend API Exception: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
    jsonError("An internal server error occurred: " . $e->getMessage(), 500);
}
