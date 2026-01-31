import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(fullName: string) {
  if (!fullName) return "";

  const parts = fullName?.trim().split(/\s+/);
  const firstInitial = parts[0][0].toUpperCase();

  if (parts.length > 1) {
    const lastInitial = parts[parts.length - 1][0].toUpperCase();
    return firstInitial + lastInitial;
  }

  return firstInitial;
}
