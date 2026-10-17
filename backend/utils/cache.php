<?php
// backend/utils/cache.php

function getCacheDir(): string {
    $dir = __DIR__ . '/../cache';
    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }
    return $dir;
}

function getCacheFilePath(string $key): string {
    return getCacheDir() . '/' . md5($key) . '.json';
}

function cacheGet(string $key): mixed {
    $file = getCacheFilePath($key);
    if (!file_exists($file)) {
        return null;
    }

    $content = @file_get_contents($file);
    if (!$content) {
        return null;
    }

    $data = @json_decode($content, true);
    if (!is_array($data) || !array_key_exists('expiresAt', $data) || !array_key_exists('value', $data)) {
        @unlink($file);
        return null;
    }

    if (time() >= $data['expiresAt']) {
        @unlink($file);
        return null;
    }

    return $data['value'];
}

function cacheSet(string $key, mixed $value, int $ttl = 300): void {
    $dir = getCacheDir();
    $targetFile = getCacheFilePath($key);
    $tmpFile = $dir . '/' . uniqid('cache_', true) . '.tmp';

    $payload = json_encode([
        'expiresAt' => time() + $ttl,
        'value' => $value,
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    if (@file_put_contents($tmpFile, $payload, LOCK_EX) !== false) {
        @rename($tmpFile, $targetFile);
    }
}

function cacheForget(string $key): void {
    $file = getCacheFilePath($key);
    if (file_exists($file)) {
        @unlink($file);
    }
}

function cacheFlushPrefix(string $prefix): void {
    $dir = getCacheDir();
    $files = glob($dir . '/*.json');
    if (!$files) return;

    foreach ($files as $f) {
        @unlink($f);
    }
}

function cacheRemember(string $key, int $ttl, callable $fn): mixed {
    $cached = cacheGet($key);
    if ($cached !== null) {
        return $cached;
    }

    $value = $fn();
    if ($value !== null) {
        cacheSet($key, $value, $ttl);
    }
    return $value;
}
