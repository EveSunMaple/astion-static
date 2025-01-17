import { codeToHtml } from "shiki";
import { CODE_THEME } from "../config";

export async function highlightCode(block) {
  const code = block.rich_text.map(text => text.plain_text).join("\n");

  const html = await codeToHtml(code, {
    lang: block.language,
    theme: CODE_THEME,
  });

  return html;
}
