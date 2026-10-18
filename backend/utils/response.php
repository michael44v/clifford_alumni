<?php
// backend/utils/response.php

function jsonResponse(mixed $data, int $statusCode = 200): void {
    global $startTime, $method, $endpoint;
    if (isset($startTime, $method, $endpoint) && function_exists('logApiRequest')) {
        $execTime = (microtime(true) - $startTime) * 1000;
        logApiRequest($method, $endpoint, $statusCode, $execTime);
    }
    if (ob_get_length()) {
        ob_clean();
    }
    $json = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Content-Length: ' . strlen($json));
    echo $json;
    exit();
}

function jsonError(string $message, int $statusCode = 400): void {
    global $startTime, $method, $endpoint;
    if (isset($startTime, $method, $endpoint) && function_exists('logApiRequest')) {
        $execTime = (microtime(true) - $startTime) * 1000;
        logApiRequest($method, $endpoint, $statusCode, $execTime, $message);
    }
    if (ob_get_length()) {
        ob_clean();
    }
    $json = json_encode(['error' => $message], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Content-Length: ' . strlen($json));
    echo $json;
    exit();
}

function getRequestBody(): array {
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return $_POST ?: [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function generateUuid(): string {
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}
