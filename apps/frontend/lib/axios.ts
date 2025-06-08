import { getFingerprint } from "@/utils";
import axios from "axios";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const fingerprint = await getFingerprint();

    if (fingerprint) {
      config.headers["X-Fingerprint"] = fingerprint;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config = error.config;

    if (
      error?.response?.status === 500 &&
      !config._retryCount &&
      !config.__isRetryRequest
    ) {
      config._retryCount = 1;
      config.__isRetryRequest = true;

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(axiosInstance(config));
        }, 1000);
      });
    }

    if (
      error?.response?.status === 500 &&
      config._retryCount &&
      config._retryCount < 3
    ) {
      config._retryCount += 1;

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(axiosInstance(config));
        }, 1000);
      });
    }

    if (
      (error?.response?.status === 401 &&
        !config._retry &&
        (error?.response?.data?.message?.includes(
          "We couldn't verify your session. Please sign in again to continue securely.",
        ) ||
          error?.response?.data?.message?.includes(
            "Missing access and refresh tokens. Please log in again.",
          ) ||
          error?.response?.data?.message?.includes(
            "Your session has expired. Please log in again.",
          ))) ||
      (error?.response?.status === 400 &&
        error?.response?.data?.message?.includes(
          "Refresh token is invalid or expired.",
        ))
    ) {
      toast.error(error?.response?.data?.message);
      localStorage.removeItem("user-storage");
      localStorage.removeItem("app-storage");
      window.location.href = "/auth/sign-in";
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
