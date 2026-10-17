<?php
// backend/utils/logger.php

function logApiRequest(string $method, string $endpoint, int $statusCode, float $executionTimeMs, ?string $errorMessage = null): void {
    $logDir = __DIR__ . '/../data';
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0777, true);
    }
    $logFile = $logDir . '/api.log';

    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $timestamp = date('c');
    $timeMs = number_format($executionTimeMs, 2);

    $logLine = sprintf(
        "[%s] IP:%s %s %s -> Status:%d (%sms)",
        $timestamp,
        $ip,
        $method,
        $endpoint,
        $statusCode,
        $timeMs
    );

    if ($errorMessage) {
        $logLine .= " | Error: " . str_replace(["\r", "\n"], ' ', $errorMessage);
    }

    $logLine .= PHP_EOL;

    @file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);
    error_log($logLine);
}
