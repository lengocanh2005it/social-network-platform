import { getFingerprint } from "@/utils";
import axios from "axios";
import { toast } from "react-hot-toast";

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
    console.error(error);

    if (
      error?.response?.status === 401 &&
      !error.config._retry &&
      (error?.response?.data?.message?.includes(
        "You are not authenticated. Please login.",
      ) ||
        error?.response?.data?.message?.includes(
          "Token verification failed. Please check and try again.",
        ))
    ) {
      error.config._retry = true;

      try {
        await axiosInstance.post(
          "/auth/token/refresh",
          {},
          { withCredentials: true },
        );

        return axiosInstance(error.config);
      } catch (refreshError) {
        console.error(refreshError);

        localStorage.removeItem("user-storage");
        localStorage.removeItem("app-storage");

        toast.error("Your session has expired. Please log in again.", {
          duration: 7000,
        });

        window.location.href = "/auth/sign-in";
      }
    }

    if (
      error?.response?.status === 401 &&
      !error.config._retry &&
      error?.response?.data?.message?.includes(
        "We couldn't verify your session. Please sign in again to continue securely.",
      )
    ) {
      localStorage.removeItem("user-storage");
      localStorage.removeItem("app-storage");
      window.location.href = "/auth/sign-in";
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
