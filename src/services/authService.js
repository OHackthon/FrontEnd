import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/";

export const authService = {
  async refreshToken() {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) {
      throw new Error("No refresh token available");
    }
    // Use plain axios to avoid interceptor loop
    const response = await axios.post(`${API_URL}token/refresh/`, {
      refresh,
    });

    localStorage.setItem("access_token", response.data.access);
    return response.data.access;
  },

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};
