import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import type { PluggableList } from "unified";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import { notionRehypePlugins } from "../src/plugins/notion-rehype";
import { computeReadingStats } from "../src/utils/readingStats";

async function render(html: string): Promise<string> {
  const output = await unified()
    .use(rehypeParse, { fragment: true })
    .use(notionRehypePlugins("github-dark") as PluggableList)
    .use(rehypeStringify)
    .process(html);
  return String(output);
}

describe("notion rehype pipeline", () => {
  it("shifts headings down one level", async () => {
    const html = await render('<h1 id="a">Title</h1>');
    expect(html).toContain('<h2 id="a">');
    expect(html).not.toContain("<h1");
  });

  it("highlights code blocks with shiki", async () => {
    const html = await render(
      '<pre><code class="language-python">print(1)</code></pre>',
    );
    expect(html).toContain("shiki");
    expect(html).toContain("style=");
  });

  it("keeps notion classes needed by styles", async () => {
    const html = await render(
      '<ul class="notion-to_do_list"><li><input type="checkbox" checked disabled>a</li></ul><div class="notion-image"><img src="/x.webp" data-notion-file-type="file" alt="x"></div>',
    );
    expect(html).toContain("notion-to_do_list");
    expect(html).toContain("notion-image");
  });

  it("strips scripts and javascript: urls", async () => {
    const html = await render(
      '<script>alert(1)</script><a href="javascript:alert(1)">x</a>',
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("javascript:");
  });

  it("marks external links with target and rel", async () => {
    const html = await render('<a href="https://example.com">x</a>');
    expect(html).toContain('target="_blank"');
    expect(html).toContain("noopener");
    expect(html).toContain("noreferrer");
  });
});

describe("computeReadingStats", () => {
  it("counts english words and chinese characters", () => {
    const stats = computeReadingStats("<p>hello world 你好</p>");
    expect(stats.totalCharCount).toBe(5);
    expect(stats.readingTime).toBeGreaterThanOrEqual(1);
  });

  it("returns at least one minute for empty content", () => {
    const stats = computeReadingStats("");
    expect(stats.totalCharCount).toBe(0);
    expect(stats.readingTime).toBe(1);
  });
});
