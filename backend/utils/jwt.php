<?php
// backend/utils/jwt.php

require_once __DIR__ . '/../config/config.php';

function base64UrlEncode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
}

function generateAccessToken(array $payload, int $expiresInSeconds = 86400): string {
    $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
    $payload['exp'] = time() + $expiresInSeconds;
    $payload['iat'] = time();

    $encodedHeader = base64UrlEncode($header);
    $encodedPayload = base64UrlEncode(json_encode($payload));

    $signature = hash_hmac('sha256', "$encodedHeader.$encodedPayload", JWT_SECRET, true);
    $encodedSignature = base64UrlEncode($signature);

    return "$encodedHeader.$encodedPayload.$encodedSignature";
}

function generateRefreshToken(array $payload): array {
    $randomBytes = random_bytes(32);
    $token = bin2hex($randomBytes);
    $hash = hashToken($token);
    return ['token' => $token, 'hash' => $hash];
}

function verifyJWT(string $jwt): ?array {
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) {
        return null;
    }

    list($encodedHeader, $encodedPayload, $encodedSignature) = $parts;

    $signature = base64UrlDecode($encodedSignature);
    $expectedSignature = hash_hmac('sha256', "$encodedHeader.$encodedPayload", JWT_SECRET, true);

    if (!hash_equals($signature, $expectedSignature)) {
        return null;
    }

    $payload = json_decode(base64UrlDecode($encodedPayload), true);
    if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
        return null;
    }

    return $payload;
}

function hashToken(string $token): string {
    return hash('sha256', $token);
}
