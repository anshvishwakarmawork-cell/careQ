/**
 * API Wrapper for CareQueue Backend
 * Includes interceptor for adding Cognito JWT tokens.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Mock function to get current Cognito token. 
// In a real app with AWS Amplify, this would be: 
// import { fetchAuthSession } from 'aws-amplify/auth';
const getAuthToken = async () => {
  // return (await fetchAuthSession()).tokens?.idToken?.toString();
  return localStorage.getItem("auth_token");
};

export const api = {
  async fetch(endpoint, options = {}) {
    const token = await getAuthToken();
    
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    // Sometimes responses don't have body
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    return response.text();
  },

  get(endpoint) {
    return this.fetch(endpoint, { method: "GET" });
  },

  post(endpoint, data) {
    return this.fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  patch(endpoint, data) {
    return this.fetch(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
  },

  delete(endpoint) {
    return this.fetch(endpoint, { method: "DELETE" });
  }
};
