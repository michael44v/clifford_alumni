<?php
// backend/config/config.php

$allowedOrigins = [
    'https://clifforduniversityalumni.com',
    'https://www.clifforduniversityalumni.com',
    'http://localhost:8443', // local dev
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Vary: Origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
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
define('CLOUDINARY_CLOUD_NAME', getenv('CLOUDINARY_CLOUD_NAME') ?: '');
define('CLOUDINARY_API_KEY', getenv('CLOUDINARY_API_KEY') ?: '');
define('CLOUDINARY_API_SECRET', getenv('CLOUDINARY_API_SECRET') ?: '');
define('CLOUDINARY_UPLOAD_PRESET', getenv('CLOUDINARY_UPLOAD_PRESET') ?: '');
define('KORAPAY_SECRET_KEY', getenv('KORAPAY_SECRET_KEY') ?: 'pk_test_sample');
define('KORAPAY_PUBLIC_KEY', getenv('KORAPAY_PUBLIC_KEY') ?: 'pk_test_sample');
