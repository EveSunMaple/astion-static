import type { NotionLoaderOptions } from "@astro-notion/loader";
import type { Element, Nodes, Root } from "hast";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { codeToHast } from "shiki";
import { visit } from "unist-util-visit";

type RehypePlugins = NonNullable<NotionLoaderOptions["rehypePlugins"]>;

/** Notion 的语言名与 shiki 不一致时的映射 */
const LANGUAGE_ALIASES: Record<string, string> = {
  "plain text": "text",
  plaintext: "text",
  "c++": "cpp",
  "c#": "csharp",
  "objective-c": "objective-c",
  shell: "bash",
  sh: "bash",
  zsh: "bash",
  powershell: "powershell",
  "visual basic": "vb",
  vb: "vb",
  sql: "sql",
  yaml: "yaml",
  yml: "yaml",
};

function collectText(node: Nodes): string {
  if (node.type === "text") return node.value;
  if ("children" in node) return node.children.map(collectText).join("");
  return "";
}

/**
 * 用 shiki 高亮 Notion 渲染出的 `<pre><code class="language-*">` 代码块。
 */
export function rehypeNotionShiki({ theme }: { theme: string }) {
  return async (tree: Root): Promise<void> => {
    const jobs: Array<{
      parent: Element | Root;
      index: number;
      lang: string;
      code: string;
    }> = [];

    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "pre") return;
      if (!parent || typeof index !== "number") return;
      const codeEl = node.children.find(
        (child): child is Element =>
          child.type === "element" && child.tagName === "code",
      );
      if (!codeEl) return;

      const classNames = Array.isArray(codeEl.properties?.className)
        ? codeEl.properties.className.map(String)
        : [];
      const langClass = classNames.find((name) => name.startsWith("language-"));
      const rawLang = (langClass ?? "language-text").slice("language-".length);
      const lang = LANGUAGE_ALIASES[rawLang.toLowerCase()] ?? rawLang;

      jobs.push({
        parent,
        index,
        lang,
        code: collectText(codeEl),
      });
    });

    for (const job of jobs) {
      let hast: Root;
      try {
        hast = (await codeToHast(job.code, {
          lang: job.lang,
          theme,
        })) as Root;
      } catch {
        hast = (await codeToHast(job.code, {
          lang: "text",
          theme,
        })) as Root;
      }
      const pre = hast.children.find(
        (child): child is Element =>
          child.type === "element" && child.tagName === "pre",
      );
      if (pre) job.parent.children[job.index] = pre;
    }
  };
}

const HEADING_MAP: Record<string, string> = {
  h1: "h2",
  h2: "h3",
  h3: "h4",
  h4: "h5",
  h5: "h6",
  h6: "h6",
};

/**
 * 详情页的页面标题已经是 h1，把正文里的 Notion 标题整体降一级，避免重复 h1。
 */
export function rehypeNotionHeadings() {
  return (tree: Root): void => {
    visit(tree, "element", (node: Element) => {
      const next = HEADING_MAP[node.tagName];
      if (next) node.tagName = next;
    });
  };
}

const baseAttributes = defaultSchema.attributes ?? {};

/** 在默认白名单基础上放行 Notion 渲染所需的标签与属性 */
export const notionSanitizeSchema = {
  ...defaultSchema,
  clobberPrefix: "",
  tagNames: [
    ...new Set([
      ...(defaultSchema.tagNames ?? []),
      "figure",
      "figcaption",
      "time",
      "mark",
    ]),
  ],
  attributes: {
    ...baseAttributes,
    "*": [...(baseAttributes["*"] ?? []), "className"],
    a: [...(baseAttributes.a ?? []), "target", "rel"],
    img: [
      ...(baseAttributes.img ?? []),
      "alt",
      "width",
      "height",
      "loading",
      "decoding",
      "dataNotionFileType",
      "data-notion-file-type",
    ],
    input: [["disabled", true], ["type", "checkbox"], "checked"],
    ul: ["className"],
    ol: ["className"],
    li: ["className"],
    details: ["className", "open"],
    summary: ["className"],
    section: ["className", "dataFootnotes"],
    div: ["className"],
    pre: ["className"],
    code: ["className"],
    span: ["className", "style"],
    table: ["className"],
    th: ["scope", "colSpan", "rowSpan"],
    td: ["colSpan", "rowSpan"],
  },
  protocols: {
    ...defaultSchema.protocols,
    src: [...new Set([...(defaultSchema.protocols?.src ?? []), "data"])],
    href: [...new Set([...(defaultSchema.protocols?.href ?? []), "tel"])],
  },
};

/**
 * 传给 @astro-notion/loader 的 rehype 插件链。
 * 顺序：sanitize（清理原始 HTML）→ 外链属性 → 标题降级 → 代码高亮（后置避免样式被清理）
 */
export function notionRehypePlugins(theme: string): RehypePlugins {
  return [
    [rehypeSanitize, notionSanitizeSchema],
    [
      rehypeExternalLinks,
      { target: "_blank", rel: ["noopener", "noreferrer"] },
    ],
    rehypeNotionHeadings,
    [rehypeNotionShiki, { theme }],
  ] as RehypePlugins;
}
