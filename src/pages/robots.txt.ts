export function GET() {
  return new Response(
    ["User-agent: *", "Allow: /", "Disallow: /downloads/", "Sitemap: https://karnivor.xyz/sitemap-index.xml", ""].join(
      "\n",
    ),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    },
  );
}
