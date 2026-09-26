// Centralized API client for communicating with backend Express API at /api

let accessToken: string | null = localStorage.getItem("cuaa_access_token");

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    localStorage.setItem("cuaa_access_token", token);
  } else {
    localStorage.removeItem("cuaa_access_token");
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: "same-origin", // includes httpOnly refreshToken cookie
  });

  // Handle token refresh on 401
  if (response.status === 401 && endpoint !== "/api/auth/refresh" && endpoint !== "/api/auth/login") {
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setAccessToken(data.accessToken);
      headers.set("Authorization", `Bearer ${data.accessToken}`);

      // Retry original request
      const retryResponse = await fetch(endpoint, {
        ...options,
        headers,
        credentials: "same-origin",
      });

      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "API request failed");
      }
      return retryResponse.json();
    } else {
      setAccessToken(null);
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
