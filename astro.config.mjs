import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { readdirSync, readFileSync } from "node:fs";

const site = "https://karnivor.xyz";
const fallbackLastmod = "2026-05-13";
const blogLastmods = getBlogLastmods();
const newestKnownLastmod = [...blogLastmods.values(), fallbackLastmod].sort().at(-1) ?? fallbackLastmod;

function getBlogLastmods() {
  const blogDir = new URL("./src/content/blog/", import.meta.url);
  const lastmods = new Map();

  for (const filename of readdirSync(blogDir)) {
    if (!filename.endsWith(".md")) continue;

    const file = readFileSync(new URL(filename, blogDir), "utf8");
    const updatedAt = frontmatterDate(file, "updatedAt") ?? frontmatterDate(file, "publishedAt");
    if (!updatedAt) continue;

    const slug = filename.replace(/\.md$/, "");
    lastmods.set(`/blog/${slug}/`, updatedAt);
  }

  return lastmods;
}

function frontmatterDate(file, field) {
  return file.match(new RegExp(`^${field}:\\s*["']?(\\d{4}-\\d{2}-\\d{2})["']?`, "m"))?.[1];
}

function lastmodForUrl(url) {
  const { pathname } = new URL(url);
  return blogLastmods.get(pathname) ?? newestKnownLastmod;
}

export default defineConfig({
  site,
  output: "static",
  integrations: [
    sitemap({
      lastmod: new Date(`${newestKnownLastmod}T00:00:00.000Z`),
      filter: (page) => !new URL(page).pathname.startsWith("/downloads/"),
      serialize: (item) => ({
        ...item,
        lastmod: lastmodForUrl(item.url),
      }),
    }),
  ],
});
