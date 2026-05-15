export type Platform = Extract<NodeJS.Platform, "darwin" | "linux">;

export type BrowserKind = "firefox" | "chrome" | "brave" | "chromium";

export type BrowserDefinition = {
  name: string;
  icon: string;
  type: "sqlite" | "json";
  paths: Record<Platform, string>;
};

export type BrowserProfile = {
  name: string;
  path: string;
};

export type BrowserEntry = {
  key: BrowserKind;
  browser: BrowserDefinition;
  profiles: BrowserProfile[];
};

export type Bookmark = {
  title: string;
  url: string;
};
