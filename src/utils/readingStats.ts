function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&#?\w+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 根据 Notion 渲染出的 HTML 估算阅读时间与字数
 * @param html 渲染后的 HTML
 * @returns 字数与阅读时间（分钟）
 */
export function computeReadingStats(html: string): {
  totalCharCount: number;
  readingTime: number;
} {
  const text = stripHtml(html);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const chineseCount = text.match(/[\u4E00-\u9FA5]/g)?.length || 0;
  const readingTime = Math.max(
    1,
    Math.ceil(wordCount / 200 + chineseCount / 300),
  );
  return { totalCharCount: wordCount + chineseCount, readingTime };
}
