// Use Vite environment variables (VITE_ prefix) or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class ApiService {
  static async fetchWithErrorHandling(url, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${url}:`, error);
      throw error;
    }
  }

  // Health check - usa il tuo endpoint esistente
  static async checkHealth() {
    return this.fetchWithErrorHandling("/health");
  }

  // Process transcript - usa il tuo endpoint esistente
  static async processTranscript(text) {
    return this.fetchWithErrorHandling("/process-text", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }

  static async getUserByName(name) {
    return this.fetchWithErrorHandling(`/users/${name}`, {
      method: "GET",
    });
  }
}

export default ApiService;
