/* eslint-disable @typescript-eslint/no-explicit-any */
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init);
  return res.json();
}

export function catchError(err: unknown) {
  if (err instanceof AxiosError) {
    return toast.error(err?.response?.data ?? err.message);
  } else if (err instanceof Error) {
    return toast.error(err.message);
  } else {
    return toast.error("Something went wrong, please try again later.");
  }
}

export function catchServerActionError(
  e: any,
  errMsg?: string
): { success: boolean; message: string } {
  return {
    success: false,
    message: e.response?.data?.error
      ? e.response?.data?.error
      : e.response?.data?.errors && Array.isArray(e.response?.data?.errors)
      ? e.response?.data.errors[0]
      : errMsg
      ? errMsg
      : "Operation failed, please try again!",
  };
}

export const getDateRange = ({
  date = new Date(),
  difference,
}: {
  date?: Date;
  difference: number;
}) => {
  const startDate = date.toISOString().split("T")[0];

  const endDateObj = new Date();
  endDateObj.setDate(date.getDate() - difference);
  const endDate = endDateObj.toISOString().split("T")[0];

  return { startDate: new Date(endDate), endDate: new Date(startDate) };
};
