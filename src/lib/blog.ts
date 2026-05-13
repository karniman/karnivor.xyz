import { readFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

const root = process.cwd();

type BlogSource = {
  slug: string;
  sourcePath: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  image?: string;
  imageAlt?: string;
  tags: string[];
  markdown: string;
  excerpt: string;
  wordCount: number;
  readingMinutes: number;
};

const blogSources: BlogSource[] = [
  {
    slug: "pochemu-prostaya-eda-kazhetsya-radikalnoy",
    sourcePath: path.join(root, "src", "content", "blog", "pochemu-prostaya-eda-kazhetsya-radikalnoy.md"),
  },
  {
    slug: "rebenok-ne-rodilsya-s-pechenem-v-ruke",
    sourcePath: path.join(root, "src", "content", "blog", "rebenok-ne-rodilsya-s-pechenem-v-ruke.md"),
  },
  {
    slug: "karnivor-shashlyk-myaso-zhir-ogon",
    sourcePath: path.join(root, "src", "content", "blog", "karnivor-shashlyk-myaso-zhir-ogon.md"),
  },
  {
    slug: "karnivor-dieta-dlya-nachinayushchih",
    sourcePath: path.join(root, "src", "content", "blog", "karnivor-dieta-dlya-nachinayushchih.md"),
  },
];

let postsCache: Promise<BlogPost[]> | undefined;

export async function getAllPosts(): Promise<BlogPost[]> {
  postsCache ??= Promise.all(blogSources.map(loadPost)).then((posts) =>
    posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
  );
  return postsCache;
}

export async function getPost(slug: string): Promise<BlogPost | undefined> {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug);
}

export async function renderPostMarkdown(post: BlogPost): Promise<string> {
  return marked.parse(post.markdown, {
    async: false,
    gfm: true,
  }) as string;
}

async function loadPost(source: BlogSource): Promise<BlogPost> {
  const file = await readFile(source.sourcePath, "utf8");
  const { frontmatter, body } = parseFrontmatter(file);
  const wordCount = countWords(body);

  return {
    slug: source.slug,
    title: stringField(frontmatter.title, source.slug),
    description: stringField(frontmatter.description, excerptFromMarkdown(body)),
    publishedAt: stringField(frontmatter.publishedAt, "2026-05-07"),
    updatedAt: stringField(frontmatter.updatedAt, stringField(frontmatter.publishedAt, "2026-05-07")),
    image: optionalStringField(frontmatter.image),
    imageAlt: optionalStringField(frontmatter.imageAlt),
    tags: arrayField(frontmatter.tags),
    markdown: body,
    excerpt: excerptFromMarkdown(body),
    wordCount,
    readingMinutes: readingMinutes(wordCount),
  };
}

function stringField(value: string | string[] | undefined, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function optionalStringField(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function arrayField(value: string | string[] | undefined): string[] {
  return Array.isArray(value) ? value : [];
}

function parseFrontmatter(file: string): { frontmatter: Record<string, string | string[]>; body: string } {
  const match = file.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: file.trim() };

  const frontmatter: Record<string, string | string[]> = {};
  const lines = match[1].split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const field = line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/);
    if (!field) continue;

    const key = field[1];
    const rawValue = field[2].trim();

    if (rawValue) {
      frontmatter[key] = rawValue.replace(/^["']|["']$/g, "");
      continue;
    }

    const values: string[] = [];
    while (lines[index + 1]?.match(/^\s+-\s+/)) {
      index += 1;
      values.push(lines[index].replace(/^\s+-\s+/, "").trim().replace(/^["']|["']$/g, ""));
    }
    frontmatter[key] = values;
  }

  return { frontmatter, body: match[2].trim() };
}

function excerptFromMarkdown(markdown: string): string {
  const paragraph = markdown
    .split(/\n{2,}/)
    .map((part) => stripMarkdown(part).trim())
    .find((part) => part.length > 80 && !isUrlOnly(part));

  if (!paragraph) return "";
  return paragraph.length > 220 ? `${paragraph.slice(0, 217).trim()}...` : paragraph;
}

function stripMarkdown(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<((?:https?|mailto):[^>\s]+)>/gi, "$1")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[#>*_`|[\]\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isUrlOnly(value: string): boolean {
  return /^(?:https?:\/\/|mailto:)\S+$/i.test(value);
}

function countWords(markdown: string): number {
  const plain = stripMarkdown(markdown).replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  return plain ? plain.split(/\s+/).length : 0;
}

function readingMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 220));
}
