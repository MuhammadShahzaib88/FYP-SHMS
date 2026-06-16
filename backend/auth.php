<?php
// backend/auth.php

define('JWT_SECRET', 'smart_hostel_secret_key_123456');

function base64UrlEncode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

function base64UrlDecode($data) {
    return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
}

function generateJWT($payload) {
    $payload['exp'] = time() + (30 * 24 * 60 * 60); // 30 days
    $payload['iat'] = time();
    
    $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode(json_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64UrlEncode($signature);
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyJWT($jwt) {
    $tokenParts = explode('.', $jwt);
    if (count($tokenParts) !== 3) return false;
    
    $header = base64UrlDecode($tokenParts[0]);
    $payloadJson = base64UrlDecode($tokenParts[1]);
    $signatureProvided = $tokenParts[2];
    
    $payload = json_decode($payloadJson, true);
    if (!$payload) return false;
    
    // Check expiration
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return false;
    }
    
    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode($payloadJson);
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64UrlEncode($signature);
    
    if (hash_equals($base64UrlSignature, $signatureProvided)) {
        return $payload;
    }
    return false;
}

function getBearerToken() {
    $headers = getallheaders();
    $authHeader = null;
    foreach ($headers as $key => $value) {
        if (strcasecmp($key, 'Authorization') === 0) {
            $authHeader = $value;
            break;
        }
    }
    
    if ($authHeader) {
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

function requireAuth() {
    $token = getBearerToken();
    if (!$token) {
        http_response_code(401);
        echo json_encode(['message' => 'No token, authorization denied']);
        exit;
    }
    
    $decoded = verifyJWT($token);
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(['message' => 'Token is not valid']);
        exit;
    }
    
    return $decoded;
}

function requireRole($allowedRoles) {
    $user = requireAuth();
    if (!in_array($user['role'], $allowedRoles)) {
        http_response_code(403);
        echo json_encode(['message' => 'Access denied: insufficient permissions']);
        exit;
    }
    return $user;
}

// Polyfill getallheaders() if it doesn't exist
if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
}
