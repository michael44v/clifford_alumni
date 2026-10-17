<?php
// backend/routes/gallery.php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/auth.php';

function handleGalleryRoutes(string $endpoint, string $method): void {
    if ($method === 'GET' && $endpoint === '/api/gallery/landing-page') {
        jsonResponse(dbQuery("SELECT p.*, m.secureUrl as photoUrl
                              FROM gallery_photos p
                              JOIN media m ON p.mediaId = m.id
                              WHERE p.isFeatured = 1 ORDER BY p.createdAt DESC LIMIT 12"));
    }

    if ($method === 'GET' && $endpoint === '/api/gallery/albums') {
        jsonResponse(dbQuery("SELECT a.*, g.setName,
                              (SELECT m.secureUrl FROM gallery_photos gp JOIN media m ON gp.mediaId = m.id WHERE gp.albumId = a.id ORDER BY gp.createdAt ASC LIMIT 1) as coverUrl,
                              (SELECT COUNT(*) FROM gallery_photos gp WHERE gp.albumId = a.id) as photoCount
                              FROM gallery_albums a
                              LEFT JOIN graduating_sets g ON a.graduatingSetId = g.id
                              ORDER BY a.createdAt DESC"));
    }

    if ($method === 'GET' && $endpoint === '/api/gallery/photos') {
        $albumId = $_GET['albumId'] ?? null;
        $sql = "SELECT p.*, m.secureUrl as photoUrl, mem.firstName, mem.lastName
                FROM gallery_photos p
                JOIN media m ON p.mediaId = m.id
                JOIN members mem ON p.uploadedById = mem.id";
        $params = [];
        if ($albumId) {
            $sql .= " WHERE p.albumId = ?";
            $params[] = $albumId;
        }
        $sql .= " ORDER BY p.createdAt DESC";
        jsonResponse(dbQuery($sql, $params));
    }

    // Protected Gallery Routes
    $user = authenticateJWT();

    if ($method === 'GET' && ($endpoint === '/api/admin/gallery/photos' || $endpoint === '/api/gallery/admin/photos')) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN', 'CONTENT_ADMIN']);
        jsonResponse(dbQuery("SELECT p.*, m.secureUrl as photoUrl, mem.firstName, mem.lastName, a.title as albumTitle
                              FROM gallery_photos p
                              JOIN media m ON p.mediaId = m.id
                              JOIN members mem ON p.uploadedById = mem.id
                              LEFT JOIN gallery_albums a ON p.albumId = a.id
                              ORDER BY p.createdAt DESC"));
    }

    if ($method === 'POST' && $endpoint === '/api/gallery/upload-multiple') {
        $body = getRequestBody();
        $photos = $body['photos'] ?? [];
        $albumTitle = trim($body['albumTitle'] ?? 'General Gallery');
        $category = trim($body['category'] ?? 'ALUMNI_EVENT');
        $graduatingSetId = trim($body['graduatingSetId'] ?? '');

        if (empty($photos)) jsonError("No photos provided for upload");

        // Find or create album
        $album = dbQueryOne("SELECT id FROM gallery_albums WHERE title = ?", [$albumTitle]);

        if ($album) {
            $albumId = $album['id'];
        } else {
            $albumId = generateUuid();
            dbQuery("INSERT INTO gallery_albums (id, title, category, graduatingSetId) VALUES (?, ?, ?, ?)", [$albumId, $albumTitle, $category, $graduatingSetId ?: null]);
        }

        $createdPhotos = [];
        foreach ($photos as $p) {
            $url = $p['url'] ?? '';
            $caption = $p['caption'] ?? '';
            $isFeatured = !empty($p['isFeatured']) ? 1 : 0;
            if (!$url) continue;

            $mediaId = generateUuid();
            dbQuery("INSERT INTO media (id, cloudinaryPublicId, secureUrl, folder) VALUES (?, ?, ?, 'gallery')", [$mediaId, 'gal-' . time() . '-' . rand(100, 999), $url]);

            $photoId = generateUuid();
            dbQuery("INSERT INTO gallery_photos (id, albumId, mediaId, caption, uploadedById, isFeatured) VALUES (?, ?, ?, ?, ?, ?)", [$photoId, $albumId, $mediaId, $caption, $user['id'], $isFeatured]);

            $createdPhotos[] = ['id' => $photoId, 'photoUrl' => $url, 'caption' => $caption];
        }

        jsonResponse(['message' => 'Photos uploaded successfully', 'albumId' => $albumId, 'photos' => $createdPhotos], 201);
    }

    if ($method === 'PUT' && preg_match('#^/api/admin/gallery/photos/([^/]+)/featured$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN', 'CONTENT_ADMIN']);
        $body = getRequestBody();
        $isFeatured = !empty($body['isFeatured']) ? 1 : 0;

        dbQuery("UPDATE gallery_photos SET isFeatured = ? WHERE id = ?", [$isFeatured, $m[1]]);
        jsonResponse(['message' => 'Photo featured status updated']);
    }

    // ADMIN REPLACE PHOTO
    if ($method === 'PUT' && preg_match('#^/api/admin/gallery/photos/([^/]+)$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN', 'CONTENT_ADMIN']);
        $photoId = $m[1];
        $body = getRequestBody();
        $newUrl = trim($body['photoUrl'] ?? $body['url'] ?? '');
        $caption = isset($body['caption']) ? trim($body['caption']) : null;

        $photo = dbQueryOne("SELECT * FROM gallery_photos WHERE id = ?", [$photoId]);
        if (!$photo) jsonError("Photo not found", 404);

        if ($newUrl) {
            dbQuery("UPDATE media SET secureUrl = ? WHERE id = ?", [$newUrl, $photo['mediaId']]);
        }

        if ($caption !== null) {
            dbQuery("UPDATE gallery_photos SET caption = ? WHERE id = ?", [$caption, $photoId]);
        }

        jsonResponse(['message' => 'Photo updated successfully']);
    }

    // ADMIN DELETE PHOTO
    if ($method === 'DELETE' && (preg_match('#^/api/admin/gallery/photos/([^/]+)$#', $endpoint, $m) || preg_match('#^/api/gallery/photos/([^/]+)$#', $endpoint, $m))) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN', 'CONTENT_ADMIN']);
        $photoId = $m[1];
        dbQuery("DELETE FROM gallery_photos WHERE id = ?", [$photoId]);
        jsonResponse(['message' => 'Photo deleted successfully']);
    }
}
