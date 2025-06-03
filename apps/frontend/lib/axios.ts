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
    if (
      (error?.response?.status === 401 &&
        !error.config._retry &&
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
