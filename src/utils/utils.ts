import slugify from "slugify";

/**
 * 生成 URL 友好的 slug
 * @param {string} title - 要生成 slug 的标题
 * @returns {string} - 生成的 slug
 */
export function generateSlug(title: string) {
  return slugify(title, {
    replacement: "-",
    remove: undefined,
    lower: true,
    strict: true,
    locale: "en",
  });
}
