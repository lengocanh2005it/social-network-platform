import { SimpleDate } from "@/utils";
import { format } from "date-fns";
import jwt from "jsonwebtoken";

export const formatDateToString = (date: SimpleDate): string => {
  const jsDate = new Date(date.year, date.month - 1, date.day);

  return format(jsDate, "yyyy-MM-dd");
};

export const isValidJWT = (token: string | null) => {
  if (!token) return false;

  const payload = jwt.decode(token);

  return !!payload;
};
