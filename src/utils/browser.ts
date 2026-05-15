import fs from "node:fs";
import { join } from "node:path";
import { BROWSERS } from "../constants.ts";
import type { BrowserEntry, BrowserProfile } from "../types.ts";
import { expandHome } from "./index.ts";
import { detectPlatform } from "./platform.ts";

const findFirefoxProfiles = (basePath: string): BrowserProfile[] => {
  const dir = expandHome(basePath);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((name) => {
      try {
        return (
          fs.statSync(join(dir, name)).isDirectory() &&
          fs.existsSync(join(dir, name, "places.sqlite"))
        );
      } catch {
        return false;
      }
    })
    .map<BrowserProfile>((name) => ({
      name,
      path: join(dir, name, "places.sqlite"),
    }));
};

const findChromiumProfiles = (basePath: string): BrowserProfile[] => {
  const dir = expandHome(basePath);
  if (!fs.existsSync(dir)) return [];

  const profiles: BrowserProfile[] = [];
  const defaultBookmarksPath = join(dir, "Default", "Bookmarks");
  if (fs.existsSync(defaultBookmarksPath)) {
    profiles.push({ name: "Default", path: defaultBookmarksPath });
  }

  try {
    fs.readdirSync(dir)
      .filter((name) => /^Profile \d+$/.test(name))
      .forEach((name) => {
        const bookmarksPath = join(dir, name, "Bookmarks");
        if (fs.existsSync(bookmarksPath)) {
          profiles.push({ name, path: bookmarksPath });
        }
      });
  } catch {}

  return profiles;
};

export const detectAvailableBrowsers = (): BrowserEntry[] => {
  const platform = detectPlatform();
  if (!platform) return [];

  const found: BrowserEntry[] = [];

  for (const [key, browser] of BROWSERS) {
    const basePath = browser.paths[platform];
    if (!basePath) continue;

    const profiles =
      browser.type === "sqlite" ? findFirefoxProfiles(basePath) : findChromiumProfiles(basePath);

    if (profiles.length > 0) {
      found.push({ key, browser, profiles });
    }
  }

  return found;
};
