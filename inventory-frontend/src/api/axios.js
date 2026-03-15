import axios from "axios";

const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (isLocalhost ? "http://localhost:8000/api/" : "https://erp-inventory-system-8zrj.onrender.com/api/"),
});

// Request Interceptor
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("access");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// Response Interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data);

    if (error.response?.status === 401) {
      localStorage.clear();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;