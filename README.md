# digpile

`digpile` is a small CLI that pulls one or more random bookmarks out of a bookmark folder so you can rediscover links you meant to revisit.

It can read directly from:

- Firefox profiles via `places.sqlite`
- Chrome bookmarks
- Brave bookmarks
- Chromium bookmarks
- Exported bookmarks HTML files

## Requirements

- Node.js `>=22`
- macOS or Linux

## Install

```bash
pnpm install
```

## Usage

Run against an installed browser profile:

```bash
pnpm start
```

Run against an exported bookmarks file:

```bash
pnpm start ~/bookmarks.html
```

Show help:

```bash
pnpm start --help
```

## Options

- `-f, --folder <name>`: bookmark folder to search. Defaults to `Pile`.
- `-n <number>`: number of bookmarks to surface. Defaults to `1`.

## Examples

```bash
pnpm start
pnpm start --folder "read later" -n 3
pnpm start -f inbox -n 5 ~/bookmarks.html
```
