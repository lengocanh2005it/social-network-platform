import { SimpleDate } from "@/utils";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { fromDate, toZoned, ZonedDateTime } from "@internationalized/date";
import { AxiosError } from "axios";
import Cookies from "js-cookie";
import { decodeJwt } from "jose";
import { toast } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import {
  format,
  isToday,
  isYesterday,
  differenceInMinutes,
  differenceInHours,
} from "date-fns";

export const formatDateToString = (date: SimpleDate): string => {
  const jsDate = new Date(date.year, date.month - 1, date.day);

  return format(jsDate, "yyyy-MM-dd");
};

export const isValidJWT = (token: string | null) => {
  if (!token) return false;

  const payload = decodeJwt(token);

  return !!payload;
};

export const isValidUUID = (value: string) => {
  const regex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  return regex.test(value);
};

export const isValidURL = (value: string) => {
  try {
    new URL(value);

    return true;
  } catch (_) {
    return false;
  }
};

export function isValidCode(code: string): boolean {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const parts = code.split(".");

  if (parts.length === 3) return parts.every((part) => uuidPattern.test(part));

  return false;
}

export function generateUUID(): string {
  return uuidv4();
}

export function getCookie(name: string): string | undefined {
  return Cookies.get(name);
}

export function setCookie(
  name: string,
  value: string,
  options?: Cookies.CookieAttributes,
) {
  Cookies.set(name, value, options);
}

export function removeCookie(name: string, options?: Cookies.CookieAttributes) {
  Cookies.remove(name, options);
}

export function toZonedDate(
  value: Date | string | undefined,
  timeZone: string = "UTC",
): ZonedDateTime | undefined {
  if (!value) return undefined;

  const dateObj = value instanceof Date ? value : new Date(value);

  if (isNaN(dateObj.getTime())) return undefined;

  const calendarDateTime = fromDate(dateObj, timeZone);

  const zonedDateTime = toZoned(calendarDateTime, timeZone);

  return zonedDateTime;
}

export function handleAxiosError(error: any) {
  if (!error || typeof error !== "object") {
    toast.error("An unexpected error occurred.");
    return;
  }

  const axiosError = error as AxiosError;

  if (!axiosError.response) {
    toast.error("Unable to connect to the server. Please try again later.");
  } else {
    const message =
      (axiosError.response.data as any)?.message ||
      axiosError.message ||
      "An unexpected error occurred. Please try again.";

    const newMessage =
      message === "timeout of 5000ms exceeded"
        ? "Things are a bit slow right now. Please try again in a few seconds."
        : message;

    toast.error(newMessage);
  }
}

export const getFingerprint = async (): Promise<string | null> => {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    const fp = await FingerprintJS.load();

    const result = await fp.get();

    return result.visitorId;
  } catch (error) {
    return null;
  }
};

export function formatPhoneNumber(phoneNumber: string): string {
  if (phoneNumber.length === 10) {
    return `${phoneNumber.slice(0, 2)}xx xxx ${phoneNumber.slice(-3)}`;
  }

  return phoneNumber;
}

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: any,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, "image/jpeg");
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

export function extractHashtags(text: string): string[] {
  const regex = /#([\p{L}\p{N}_]+)/gu;
  const matches = [...text.matchAll(regex)];
  return matches.map((match) => match[1]);
}

export function formatDateTime(date: Date | string) {
  const d = new Date(date);
  const now = new Date();

  const minutes = differenceInMinutes(now, d);
  const hours = differenceInHours(now, d);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24 && isToday(d)) return `${hours} hours ago`;
  if (isYesterday(d)) return `Yesterday at ${format(d, "HH:mm")}`;

  const sameYear = now.getFullYear() === d.getFullYear();

  return sameYear
    ? format(d, "d MMM 'at' HH:mm")
    : format(d, "d MMM, yyyy 'at' HH:mm");
}

export function formatDateTimeFacebookStyle(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();

  const minutes = differenceInMinutes(now, d);
  const hours = differenceInHours(now, d);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24 && isToday(d)) return `${hours}h`;
  if (isYesterday(d)) return "Yesterday";

  const sameYear = now.getFullYear() === d.getFullYear();

  return sameYear ? format(d, "d MMM") : format(d, "d MMM yyyy");
}

export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
};
