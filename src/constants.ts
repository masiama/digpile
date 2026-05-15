import type { BrowserDefinition, BrowserKind } from "./types.ts";

export const DEFAULT_FOLDER = "Pile";

export const BROWSERS = new Map<BrowserKind, BrowserDefinition>([
  [
    "firefox",
    {
      name: "Firefox",
      icon: "🦊",
      type: "sqlite",
      paths: {
        darwin: "~/Library/Application Support/Firefox/Profiles",
        linux: "~/.mozilla/firefox",
      },
    },
  ],
  [
    "chrome",
    {
      name: "Chrome",
      icon: "🌐",
      type: "json",
      paths: {
        darwin: "~/Library/Application Support/Google/Chrome",
        linux: "~/.config/google-chrome",
      },
    },
  ],
  [
    "brave",
    {
      name: "Brave",
      icon: "🦁",
      type: "json",
      paths: {
        darwin: "~/Library/Application Support/BraveSoftware/Brave-Browser",
        linux: "~/.config/BraveSoftware/Brave-Browser",
      },
    },
  ],
  [
    "chromium",
    {
      name: "Chromium",
      icon: "⚙️",
      type: "json",
      paths: {
        darwin: "~/Library/Application Support/Chromium",
        linux: "~/.config/chromium",
      },
    },
  ],
]);
