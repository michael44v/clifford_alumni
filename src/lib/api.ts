// Centralized API client for communicating with backend Express API at /api

let accessToken: string | null = localStorage.getItem("cuaa_access_token");
let isSessionExpiredNotified = false;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    isSessionExpiredNotified = false;
    localStorage.setItem("cuaa_access_token", token);
  } else {
    localStorage.removeItem("cuaa_access_token");
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // includes httpOnly refreshToken cookie
  });

  // Handle token refresh on 401
  if (response.status === 401 && !endpoint.includes("/api/auth/refresh") && !endpoint.includes("/api/auth/login")) {
    const refreshUrl = `${BASE_URL}/api/auth/refresh`;
    const refreshRes = await fetch(refreshUrl, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setAccessToken(data.accessToken);
      headers.set("Authorization", `Bearer ${data.accessToken}`);

      // Retry original request
      const retryResponse = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "API request failed");
      }
      return retryResponse.json();
    } else {
      setAccessToken(null);
      if (!isSessionExpiredNotified) {
        isSessionExpiredNotified = true;
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cuaa:session-expired"));
        }
      }
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "An error occurred");
  }

  return response.json();
}

// Cloudinary Direct Upload Helper using Backend Signature
export async function uploadToCloudinary(file: File, folder: string = "alumni/uploads"): Promise<{ url: string; publicId: string }> {
  const sigData = await apiFetch(`/api/auth/cloudinary-signature?folder=${encodeURIComponent(folder)}`);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sigData.apiKey);
  formData.append("timestamp", sigData.timestamp.toString());
  formData.append("signature", sigData.signature);
  formData.append("folder", sigData.folder);

  const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!cloudinaryRes.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const result = await cloudinaryRes.json();
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}
