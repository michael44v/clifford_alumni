<?php
// backend/routes/news.php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/auth.php';

function handleNewsRoutes(string $endpoint, string $method): void {
    if ($method === 'GET' && $endpoint === '/api/news') {
        header('Cache-Control: public, max-age=60, stale-while-revalidate=300');
        $qs = $_SERVER['QUERY_STRING'] ?? '';
        $cacheKey = 'news:list' . ($qs ? ':' . $qs : '');
        $data = cacheRemember($cacheKey, 300, function() {
            return dbQuery("SELECT n.*, m.secureUrl as bannerUrl, mem.firstName, mem.lastName
                            FROM news_announcements n
                            LEFT JOIN media m ON n.bannerMediaId = m.id
                            LEFT JOIN members mem ON n.createdById = mem.id
                            WHERE n.isPublished = 1
                            ORDER BY n.publishedAt DESC");
        });
        jsonResponse($data);
    }

    if ($method === 'GET' && preg_match('#^/api/news/([^/]+)$#', $endpoint, $m)) {
        header('Cache-Control: public, max-age=60, stale-while-revalidate=300');
        $newsIdOrSlug = $m[1];
        $news = cacheRemember("news:item:{$newsIdOrSlug}", 300, function() use ($newsIdOrSlug) {
            return dbQueryOne("SELECT n.*, m.secureUrl as bannerUrl, mem.firstName, mem.lastName
                               FROM news_announcements n
                               LEFT JOIN media m ON n.bannerMediaId = m.id
                               LEFT JOIN members mem ON n.createdById = mem.id
                               WHERE n.id = ? OR n.slug = ?", [$newsIdOrSlug, $newsIdOrSlug]);
        });
        if (!$news) jsonError("News item not found", 404);
        jsonResponse($news);
    }

    $user = authenticateJWT();

    if ($method === 'POST' && $endpoint === '/api/news') {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN', 'CONTENT_ADMIN', 'EXCO_ADMIN']);
        $body = getRequestBody();
        $title = trim($body['title'] ?? '');
        $content = trim($body['content'] ?? '');
        $category = trim($body['category'] ?? 'OFFICIAL_ANNOUNCEMENT');
        $bannerUrl = trim($body['bannerUrl'] ?? '');

        if (!$title || !$content) jsonError("Title and content are required");

        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-')) . '-' . time();
        $newId = generateUuid();
        $bannerMediaId = null;

        if ($bannerUrl) {
            $bannerMediaId = generateUuid();
            dbQuery("INSERT INTO media (id, cloudinaryPublicId, secureUrl, folder) VALUES (?, ?, ?, 'news')", [$bannerMediaId, 'news-' . time(), $bannerUrl]);
        }

        dbQuery("INSERT INTO news_announcements (id, title, slug, content, category, bannerMediaId, createdById) VALUES (?, ?, ?, ?, ?, ?, ?)", [$newId, $title, $slug, $content, $category, $bannerMediaId, $user['id']]);

        cacheForget('news:list');
        jsonResponse(dbQueryOne("SELECT * FROM news_announcements WHERE id = ?", [$newId]), 201);
    }

    if ($method === 'DELETE' && preg_match('#^/api/news/([^/]+)$#', $endpoint, $m)) {
        requireRole($user, ['ADMIN', 'SUPER_ADMIN', 'CONTENT_ADMIN']);
        $id = $m[1];
        dbQuery("DELETE FROM news_announcements WHERE id = ?", [$id]);
        cacheForget('news:list');
        cacheForget("news:item:{$id}");
        jsonResponse(['message' => 'News announcement deleted successfully']);
    }
}
