<?php
// backend/utils/cloudinary.php

require_once __DIR__ . '/../config/config.php';

function generateUploadSignature(string $folder = 'alumni/uploads'): array {
    $timestamp = time();
    $paramsToSign = "folder={$folder}&timestamp={$timestamp}";
    $signature = sha1($paramsToSign . CLOUDINARY_API_SECRET);

    return [
        'signature' => $signature,
        'timestamp' => $timestamp,
        'apiKey' => CLOUDINARY_API_KEY,
        'cloudName' => CLOUDINARY_CLOUD_NAME,
        'uploadPreset' => CLOUDINARY_UPLOAD_PRESET,
        'folder' => $folder,
    ];
}
