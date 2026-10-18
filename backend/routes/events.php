<?php
// backend/routes/events.php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/auth.php';

function handleEventRoutes(string $endpoint, string $method): void {
    if ($method === 'GET' && $endpoint === '/api/events') {
        header('Cache-Control: public, max-age=60, stale-while-revalidate=300');
        $qs = $_SERVER['QUERY_STRING'] ?? '';
        $cacheKey = 'events:list' . ($qs ? ':' . $qs : '');
        $data = cacheRemember($cacheKey, 300, function() {
            return dbQuery("SELECT e.*, m.secureUrl as bannerUrl
                            FROM events e
                            LEFT JOIN media m ON e.bannerMediaId = m.id
                            ORDER BY e.eventDate ASC");
        });
        jsonResponse($data);
    }

    if ($method === 'GET' && preg_match('#^/api/events/([^/]+)$#', $endpoint, $m)) {
        header('Cache-Control: public, max-age=60, stale-while-revalidate=300');
        $eventIdOrSlug = $m[1];
        $event = cacheRemember("events:item:{$eventIdOrSlug}", 300, function() use ($eventIdOrSlug) {
            return dbQueryOne("SELECT e.*, m.secureUrl as bannerUrl
                               FROM events e
                               LEFT JOIN media m ON e.bannerMediaId = m.id
                               WHERE e.id = ? OR e.slug = ?", [$eventIdOrSlug, $eventIdOrSlug]);
        });
        if (!$event) jsonError("Event not found", 404);
        jsonResponse($event);
    }

    // Protected Event Routes
    $user = authenticateJWT();

    if ($method === 'POST' && $endpoint === '/api/events') {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN', 'CONTENT_ADMIN', 'EXCO_ADMIN']);
        $body = getRequestBody();
        $title = trim($body['title'] ?? '');
        $description = trim($body['description'] ?? '');
        $eventDate = trim($body['eventDate'] ?? '');
        $time = trim($body['time'] ?? '');
        $venue = trim($body['venue'] ?? '');
        $category = trim($body['category'] ?? 'General');
        $isVirtual = !empty($body['isVirtual']) ? 1 : 0;
        $meetingLink = trim($body['meetingLink'] ?? '');
        $bannerUrl = trim($body['bannerUrl'] ?? '');

        if (!$title || !$description || !$eventDate) jsonError("Title, description, and event date are required");

        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-')) . '-' . time();
        $newId = generateUuid();
        $bannerMediaId = null;

        if ($bannerUrl) {
            $bannerMediaId = generateUuid();
            dbQuery("INSERT INTO media (id, cloudinaryPublicId, secureUrl, folder) VALUES (?, ?, ?, 'events')", [$bannerMediaId, 'banner-' . time(), $bannerUrl]);
        }

        dbQuery("INSERT INTO events (id, title, slug, description, bannerMediaId, eventDate, time, venue, isVirtual, meetingLink, category, createdById) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [$newId, $title, $slug, $description, $bannerMediaId, $eventDate, $time, $venue, $isVirtual, $meetingLink, $category, $user['id']]);

        cacheFlushPrefix('events');
        jsonResponse(dbQueryOne("SELECT * FROM events WHERE id = ?", [$newId]), 201);
    }

    if ($method === 'DELETE' && preg_match('#^/api/events/([^/]+)$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN', 'CONTENT_ADMIN']);
        $id = $m[1];
        dbQuery("DELETE FROM events WHERE id = ?", [$id]);
        cacheFlushPrefix('events');
        jsonResponse(['message' => 'Event deleted successfully']);
    }

    if ($method === 'POST' && preg_match('#^/api/events/([^/]+)/register$#', $endpoint, $m)) {
        $eventId = $m[1];
        dbQuery("INSERT IGNORE INTO event_registrations (id, eventId, memberId, status) VALUES (?, ?, ?, 'REGISTERED')", [generateUuid(), $eventId, $user['id']]);
        jsonResponse(['message' => 'Registered for event successfully']);
    }
}
