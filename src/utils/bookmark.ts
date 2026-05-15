import { box, log } from "@clack/prompts";
import { readFile, copyFile, unlink } from "fs/promises";
import chalk from "chalk";
import { join } from "node:path";
import { tmpdir } from "node:os";
import Database from "better-sqlite3";
import { JSDOM } from "jsdom";
import * as v from "valibot";
import type { Bookmark } from "../types.ts";

export const readHTMLBookmarks = async (
  filePath: string,
  folderName: string,
): Promise<Bookmark[]> => {
  const html = await readFile(filePath, "utf8");
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const headers = Array.from(doc.querySelectorAll("h3"));
  const targetHeader = headers.find(
    (header) => header.textContent?.trim().toLowerCase() === folderName.toLowerCase(),
  );
  const container = targetHeader?.nextElementSibling;
  if (!container) return [];
  return Array.from(container.querySelectorAll("a")).map(
    (anchor): Bookmark => ({
      title: anchor.textContent?.trim() || anchor.href,
      url: anchor.href,
    }),
  );
};

export const readFirefoxBookmarks = async (
  dbPath: string,
  folderName: string,
): Promise<Bookmark[]> => {
  const tmpPath = join(tmpdir(), `digpile-${Date.now()}.sqlite`);
  await copyFile(dbPath, tmpPath);

  try {
    const db = new Database(tmpPath, { readonly: true });
    const folderRows = db
      .prepare<[string], { id: number }>(
        "SELECT id FROM moz_bookmarks WHERE type = 2 AND LOWER(title) = LOWER(?)",
      )
      .all(folderName);
    if (folderRows.length === 0) {
      db.close();
      return [];
    }

    const folderIds = folderRows.map((row) => row.id);
    const placeholders = folderIds.map(() => "?").join(",");

    const rows = db
      .prepare<number[], { title: string; url: string }>(
        `WITH RECURSIVE subtree(id, type, fk, title) AS (
          SELECT id, type, fk, title FROM moz_bookmarks
          WHERE parent IN (${placeholders})
          UNION ALL
          SELECT b.id, b.type, b.fk, b.title
          FROM moz_bookmarks b JOIN subtree s ON b.parent = s.id
        )
        SELECT s.title, p.url
        FROM subtree s JOIN moz_places p ON s.fk = p.id
        WHERE s.type = 1 AND p.url NOT LIKE 'place:%'`,
      )
      .all(...folderIds);

    db.close();
    return rows.map((row) => ({
      title: row.title || row.url,
      url: row.url,
    }));
  } finally {
    try {
      await unlink(tmpPath);
    } catch {}
  }
};

type ChromiumBookmarkNode =
  | { type: "folder"; name: string; children: ChromiumBookmarkNode[] }
  | { type: "url"; name: string; url: string };

const ChromiumBookmarkNode: v.GenericSchema<ChromiumBookmarkNode> = v.union([
  v.object({
    type: v.literal("folder"),
    name: v.string(),
    children: v.array(v.lazy(() => ChromiumBookmarkNode)),
  }),
  v.object({ type: v.literal("url"), name: v.string(), url: v.string() }),
]);

const ChromiumBookmarksFile = v.object({
  roots: v.record(v.string(), ChromiumBookmarkNode),
});

export const readChromiumBookmarks = async (
  bookmarksPath: string,
  folderName: string,
): Promise<Bookmark[]> => {
  const raw = await v.parseAsync(
    ChromiumBookmarksFile,
    JSON.parse(await readFile(bookmarksPath, "utf8")),
  );
  const bookmarks: Bookmark[] = [];

  const collectAll = (node: ChromiumBookmarkNode): void => {
    if (node.type === "url") {
      bookmarks.push({ title: node.name, url: node.url });
      return;
    }

    for (const child of node.children) {
      collectAll(child);
    }
  };

  const findFolder = (node: ChromiumBookmarkNode): boolean => {
    if (node.type !== "folder") return false;

    if (node.name.toLowerCase() === folderName.toLowerCase()) {
      collectAll(node);
      return true;
    }

    return node.children.some(findFolder);
  };

  for (const root of Object.values(raw.roots)) {
    if (findFolder(root)) break;
  }

  return bookmarks;
};

export const printResult = (bookmarks: Bookmark[], total: number, folder: string): void => {
  box(
    bookmarks
      .map((bookmark) => `${chalk.bold(bookmark.title)}\n${chalk.cyan(` ${bookmark.url}`)}`)
      .join("\n\n"),
    "",
    {
      rounded: true,
      formatBorder: (text) => chalk.dim(text),
    },
  );
  log.success(
    chalk.dim(
      `${bookmarks.length} of ${total} bookmarks surfaced from ` + chalk.italic(`"${folder}"`),
    ),
  );
};
