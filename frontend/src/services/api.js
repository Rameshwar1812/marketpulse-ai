import { authStorage } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(endpoint, options = {}) {
  const token = authStorage.getToken();
  
  const headers = {
    ...options.headers,
  };
  
  // Conditionally set Content-Type unless uploading FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  
  try {
    const response = await fetch(url, config);
    
    if (response.status === 401) {
      authStorage.clearAll();
      if (!window.location.pathname.endsWith("/login") && !window.location.pathname.endsWith("/register")) {
        window.location.href = "/login?expired=true";
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Session expired. Please log in again.");
    }
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `API Request Failed: ${response.statusText}`);
    }
    
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Fetch Error [${options.method || 'GET'} ${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  get(endpoint, options = {}) {
    return request(endpoint, { ...options, method: "GET" });
  },
  post(endpoint, body, options = {}) {
    return request(endpoint, { 
      ...options, 
      method: "POST", 
      body: body ? JSON.stringify(body) : undefined 
    });
  },
  upload(endpoint, file, options = {}) {
    const formData = new FormData();
    formData.append("file", file);
    return request(endpoint, {
      ...options,
      method: "POST",
      body: formData
    });
  }
};
export default api;
