import { cancel } from "@clack/prompts";
import { stat } from "node:fs/promises";
import { homedir } from "node:os";

export const expandHome = (path: string): string => path.replace(/^~/, homedir());

export const fatal = (message: string): never => {
  cancel(message);
  process.exit(1);
};

export const nonFatal = (message: string): never => {
  cancel(message);
  process.exit(0);
};

export const exists = async (f: string): Promise<boolean> => {
  try {
    await stat(f);
    return true;
  } catch {
    return false;
  }
};

export const getRandom = <T>(arr: T[], n: number): T[] =>
  arr.toSorted(() => Math.random() - 0.5).slice(0, n);
