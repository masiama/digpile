import chalk from "chalk";
import { isCancel, log, select } from "@clack/prompts";
import type { BrowserEntry, BrowserProfile } from "../types.ts";
import { fatal, nonFatal } from "./index.ts";

export const promptBrowserAndProfile = async (
  available: BrowserEntry[],
): Promise<{ browser: BrowserEntry; profile: BrowserProfile }> => {
  if (available.length === 0) {
    return fatal("No supported browsers found. Supported: Firefox, Chrome, Brave, Chromium.");
  }

  let selectedBrowser = available[0];
  if (available.length === 1) {
    log.info(chalk.dim(`Using ${selectedBrowser.browser.icon} ${selectedBrowser.browser.name}`));
  } else {
    const key = await select({
      message: "Browser",
      options: available.map(({ browser, key }) => ({
        label: `${browser.icon} ${browser.name}`,
        value: key,
      })),
    });

    if (isCancel(key)) {
      return nonFatal("Operation cancelled");
    }

    const browser = available.find((entry) => entry.key === key);
    if (!browser) {
      return fatal(`Unknown browser selection: ${key}`);
    }
    selectedBrowser = browser;
  }

  let selectedProfile = selectedBrowser.profiles[0];
  if (selectedBrowser.profiles.length === 1) {
    log.info(chalk.dim(`Profile: ${selectedProfile.name}`));
  } else {
    const profileName = await select({
      message: "Profile",
      options: selectedBrowser.profiles.map(({ name }) => ({
        label: name,
        value: name,
      })),
    });

    if (isCancel(profileName)) {
      return nonFatal("Operation cancelled");
    }

    const profile = selectedBrowser.profiles.find((entry) => entry.name === profileName);
    if (!profile) {
      return fatal(`Unknown profile selection: ${profileName}`);
    }
    selectedProfile = profile;
  }

  return { browser: selectedBrowser, profile: selectedProfile };
};
