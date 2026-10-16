<?php
// backend/routes/community.php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/auth.php';

function handleCommunityRoutes(string $endpoint, string $method): void {
    if ($method === 'GET' && $endpoint === '/api/community/posts') {
        $category = $_GET['category'] ?? null;
        $sql = "SELECT p.*, m.firstName, m.lastName, m.profession, med.secureUrl as mediaUrl,
                       (SELECT COUNT(*) FROM discussion_comments c WHERE c.postId = p.id) as commentCount
                FROM discussion_posts p
                JOIN members m ON p.authorId = m.id
                LEFT JOIN media med ON p.mediaId = med.id";
        $params = [];

        if ($category && $category !== 'All') {
            $sql .= " WHERE p.category = ?";
            $params[] = $category;
        }

        $sql .= " ORDER BY p.createdAt DESC";
        $posts = dbQuery($sql, $params);

        // Fetch comments for each post
        foreach ($posts as &$post) {
            $post['comments'] = dbQuery("SELECT c.*, mem.firstName, mem.lastName
                                        FROM discussion_comments c
                                        JOIN members mem ON c.authorId = mem.id
                                        WHERE c.postId = ? ORDER BY c.createdAt ASC", [$post['id']]);
        }

        jsonResponse($posts);
    }

    $user = authenticateJWT();

    if ($method === 'POST' && $endpoint === '/api/community/posts') {
        $body = getRequestBody();
        $title = trim($body['title'] ?? '');
        $content = trim($body['content'] ?? '');
        $category = trim($body['category'] ?? 'General');

        if (!$title || !$content) jsonError("Title and content are required");

        $newId = generateUuid();
        dbQuery("INSERT INTO discussion_posts (id, authorId, category, title, content) VALUES (?, ?, ?, ?, ?)", [$newId, $user['id'], $category, $title, $content]);

        $post = dbQueryOne("SELECT p.*, m.firstName, m.lastName FROM discussion_posts p JOIN members m ON p.authorId = m.id WHERE p.id = ?", [$newId]);
        $post['comments'] = [];
        jsonResponse($post, 201);
    }

    if ($method === 'PUT' && preg_match('#^/api/community/posts/([^/]+)$#', $endpoint, $m)) {
        $postId = $m[1];
        $body = getRequestBody();
        $title = trim($body['title'] ?? '');
        $content = trim($body['content'] ?? '');

        $post = dbQueryOne("SELECT * FROM discussion_posts WHERE id = ?", [$postId]);

        if (!$post) jsonError("Post not found", 404);
        if ($post['authorId'] !== $user['id'] && $user['role'] !== 'ADMIN' && $user['role'] !== 'SUPER_ADMIN') {
            jsonError("Forbidden: Not post author", 403);
        }

        dbQuery("UPDATE discussion_posts SET title = COALESCE(NULLIF(?, ''), title), content = COALESCE(NULLIF(?, ''), content), updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [$title, $content, $postId]);

        jsonResponse(['message' => 'Post updated successfully']);
    }

    if ($method === 'DELETE' && preg_match('#^/api/community/posts/([^/]+)$#', $endpoint, $m)) {
        $postId = $m[1];
        $post = dbQueryOne("SELECT * FROM discussion_posts WHERE id = ?", [$postId]);

        if (!$post) jsonError("Post not found", 404);
        if ($post['authorId'] !== $user['id'] && $user['role'] !== 'ADMIN' && $user['role'] !== 'SUPER_ADMIN') {
            jsonError("Forbidden: Not post author", 403);
        }

        dbQuery("DELETE FROM discussion_posts WHERE id = ?", [$postId]);
        jsonResponse(['message' => 'Post deleted successfully']);
    }

    if ($method === 'POST' && preg_match('#^/api/community/posts/([^/]+)/comments$#', $endpoint, $m)) {
        $postId = $m[1];
        $body = getRequestBody();
        $content = trim($body['content'] ?? '');

        if (!$content) jsonError("Comment content is required");

        $newId = generateUuid();
        dbQuery("INSERT INTO discussion_comments (id, postId, authorId, content) VALUES (?, ?, ?, ?)", [$newId, $postId, $user['id'], $content]);

        jsonResponse(dbQueryOne("SELECT c.*, m.firstName, m.lastName FROM discussion_comments c JOIN members m ON c.authorId = m.id WHERE c.id = ?", [$newId]), 201);
    }
}
