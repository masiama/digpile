import type { Platform } from "../types.ts";

export const detectPlatform = (): Platform | null => {
  if (process.platform === "darwin") return "darwin";
  if (process.platform === "linux") return "linux";
  return null;
};
