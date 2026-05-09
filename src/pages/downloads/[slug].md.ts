import { readFile } from "node:fs/promises";
import { getAllBooks, type Book } from "../../lib/books";

export async function getStaticPaths() {
  const books = await getAllBooks();
  return books.map((book) => ({
    params: { slug: book.slug },
    props: { book },
  }));
}

export async function GET({ props }: { props: { book: Book } }) {
  const { book } = props;
  const markdown = await readFile(book.sourcePath, "utf8");

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${book.slug}.md"`,
    },
  });
}
