#!/usr/bin/env node
import fs from "node:fs";
import chalk from "chalk";
import { Command } from "@commander-js/extra-typings";
import { intro, outro } from "@clack/prompts";
import { DEFAULT_FOLDER } from "./constants.ts";
import { detectAvailableBrowsers } from "./utils/browser.ts";
import {
  printResult,
  readChromiumBookmarks,
  readFirefoxBookmarks,
  readHTMLBookmarks,
} from "./utils/bookmark.ts";
import type { Bookmark } from "./types.ts";
import { promptBrowserAndProfile } from "./utils/prompt.ts";
import { fatal, getRandom } from "./utils/index.ts";

const program = new Command();

program
  .name("digpile")
  .description("Dig a random link out of your bookmark pile")
  .argument("[file]")
  .option("-f, --folder <name>", "folder name to dig from", DEFAULT_FOLDER)
  .option("-n <number>", "how many links to surface", (v) => parseInt(v, 10), 1)
  .action(async (file, options) => {
    intro(chalk.bold.green("⛏ digpile"));

    let bookmarks: Bookmark[] | null;

    if (file) {
      if (!fs.existsSync(file)) {
        return fatal(chalk.red(`File not found: ${file}`));
      }

      bookmarks = await readHTMLBookmarks(file, options.folder);
      if (bookmarks.length === 0) {
        return fatal(
          chalk.red(`Folder "${options.folder}" not found in ${file}.`) +
            chalk.dim(" Try -f with a different folder name."),
        );
      }
    } else {
      const available = detectAvailableBrowsers();
      const { browser, profile } = await promptBrowserAndProfile(available);

      if (browser.browser.type === "sqlite") {
        bookmarks = await readFirefoxBookmarks(profile.path, options.folder);
      } else {
        bookmarks = await readChromiumBookmarks(profile.path, options.folder);
      }

      if (bookmarks.length === 0) {
        return fatal(
          chalk.red(`Folder "${options.folder}" not found.`) +
            chalk.dim(" Try -f with a different folder name."),
        );
      }
    }

    const picks = getRandom(bookmarks, Math.max(1, options.n));
    printResult(picks, bookmarks.length, options.folder);
    outro("Happy browsing!");
  });

program.addHelpText(
  "after",
  `
Examples:
  digpile
  digpile --folder "read later" -n 3
  digpile -f inbox -n 5 ~/bookmarks.html

Supported browsers:   Firefox 🦊  Chrome 🌐  Brave 🦁  Chromium ⚙️
Supported platforms:  macOS · Linux`,
);

program.parse();
