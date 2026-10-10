import axios from "axios";

const api = axios.create({
  baseURL: "https://waterflow-backend.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const publicEndpoints = [
  "/auth/login/",
  "/auth/register/",
  "/auth/refresh/",
];

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    const isPublicEndpoint = publicEndpoints.includes(config.url);

    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      publicEndpoints.includes(originalRequest?.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("username");

      window.location.href = "/login";

      return Promise.reject(error);
    }

    try {
      const refreshResponse = await axios.post(
        "https://waterflow-backend.onrender.com/api/auth/refresh/",
        {
          refresh: refreshToken,
        }
      );

      const newAccessToken = refreshResponse.data.access;

      localStorage.setItem("access_token", newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError);

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("username");

      window.location.href = "/login";

      return Promise.reject(refreshError);
    }
  }
);

export default api;