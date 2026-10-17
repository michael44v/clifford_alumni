<?php
// backend/config/config.php

// CORS and response settings
header("Access-Control-Allow-Origin: " . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Global JSON Content-Type header
header("Content-Type: application/json; charset=UTF-8");

// Load .env if present
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2) + [NULL, NULL];
        if ($name !== NULL && $value !== NULL) {
            $name = trim($name);
            $value = trim($value);
            $_ENV[$name] = $value;
            putenv("$name=$value");
        }
    }
}

// Configuration Constants
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'cuaa_jwt_super_secret_key_2025_change_in_prod');
define('CLOUDINARY_CLOUD_NAME', getenv('CLOUDINARY_CLOUD_NAME') ?: 'dqlw0y3xa');
define('CLOUDINARY_API_KEY', getenv('CLOUDINARY_API_KEY') ?: '982746152843912');
define('CLOUDINARY_API_SECRET', getenv('CLOUDINARY_API_SECRET') ?: 'a_secret_key_here');
define('KORAPAY_SECRET_KEY', getenv('KORAPAY_SECRET_KEY') ?: 'pk_test_sample');
define('KORAPAY_PUBLIC_KEY', getenv('KORAPAY_PUBLIC_KEY') ?: 'pk_test_sample');
