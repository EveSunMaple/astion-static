import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import type { Post } from "@interfaces/data";
import { computeReadingStats } from "./readingStats";

export { computeReadingStats };

export type NotionPostType = "Post" | "Blog";

/**
 * Resolve the public slug of a Notion-backed post.
 * Falls back to the Notion page id when the `Slug` property is empty or
 * reduces to nothing (e.g. a Chinese-only title with strict slugify).
 */
export function getPostSlug(post: CollectionEntry<"blog">): string {
  return post.data.slug || post.id;
}

function assertUniqueSlugs(posts: CollectionEntry<"blog">[]): void {
  const seen = new Map<string, string>();
  for (const post of posts) {
    const slug = getPostSlug(post);
    const existing = seen.get(slug);
    if (existing) {
      throw new Error(
        `Duplicate slug "${slug}" found in Notion: "${existing}" and "${post.data.title}". Please set a unique Slug property.`,
      );
    }
    seen.set(slug, post.data.title);
  }
}

/**
 * 获取指定类型的全部内容（生产环境过滤草稿）
 * @param type 内容类型
 * @returns 对应类型的内容集合
 */
export async function getAllPostsByType(
  type: NotionPostType,
): Promise<CollectionEntry<"blog">[]> {
  const allPosts = await getCollection("blog");
  const typedPosts = allPosts.filter((post) => post.data.type === type);
  const publishedPosts = import.meta.env.PROD
    ? typedPosts.filter((post) => !post.data.draft)
    : typedPosts;
  assertUniqueSlugs(publishedPosts);
  return publishedPosts;
}

/**
 * 获取所有博客文章并根据环境过滤草稿
 * @returns 博客文章集合
 */
export async function getAllPosts(): Promise<CollectionEntry<"blog">[]> {
  return await getAllPostsByType("Blog");
}

/**
 * 获取所有说说（Post）
 * @returns 说说集合
 */
export async function getAllShuoshuo(): Promise<CollectionEntry<"blog">[]> {
  return await getAllPostsByType("Post");
}

/**
 * 按发布日期对文章进行排序（最新的排在前面）
 * @param posts 需要排序的文章
 * @returns 排序后的文章
 */
export function sortPostsByDate(
  posts: CollectionEntry<"blog">[],
): CollectionEntry<"blog">[] {
  return [...posts].sort((a, b) => {
    const dateA = a.data.pubDate ? new Date(a.data.pubDate).getTime() : 0;
    const dateB = b.data.pubDate ? new Date(b.data.pubDate).getTime() : 0;
    return dateB - dateA;
  });
}

/**
 * 将文章按置顶和日期排序
 * @param posts 需要排序的文章
 * @returns 排序后的文章 (置顶文章优先，然后是按日期排序)
 */
export function sortPostsByPinAndDate(
  posts: CollectionEntry<"blog">[],
): CollectionEntry<"blog">[] {
  const topPosts = posts.filter((post) => post.data.badge === "Pin");
  const otherPosts = posts.filter((post) => post.data.badge !== "Pin");
  return [...sortPostsByDate(topPosts), ...sortPostsByDate(otherPosts)];
}

/**
 * 获取所有文章标签并统计每个标签的数量
 * @param posts 文章集合
 * @returns 标签映射 (标签名 -> 计数)
 */
export function getTagsWithCount(
  posts: CollectionEntry<"blog">[],
): Map<string, number> {
  const tagMap = new Map<string, number>();

  posts.forEach((post) => {
    if (post.data.tags) {
      post.data.tags.forEach((tag: string) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    }
  });

  return tagMap;
}

/**
 * 获取所有文章分类并按分类对文章进行分组
 * @param posts 文章集合
 * @returns 分类映射 (分类名 -> 文章数组)
 */
export function getCategoriesWithPosts(
  posts: CollectionEntry<"blog">[],
): Map<string, CollectionEntry<"blog">[]> {
  const categoryMap = new Map<string, CollectionEntry<"blog">[]>();

  posts.forEach((post) => {
    if (post.data.categories) {
      post.data.categories.forEach((category: string) => {
        if (!categoryMap.has(category)) {
          categoryMap.set(category, []);
        }
        categoryMap.get(category)!.push(post);
      });
    }
  });

  return categoryMap;
}

/**
 * 获取按年份和月份分组的文章
 * @param posts 文章集合
 * @returns 嵌套映射 (年份 -> (月份 -> 文章数组))
 */
export function getPostsByYearAndMonth(
  posts: CollectionEntry<"blog">[],
): Map<string, Map<string, CollectionEntry<"blog">[]>> {
  const postsByDate = new Map<string, Map<string, CollectionEntry<"blog">[]>>();

  posts.forEach((post) => {
    if (!post.data.pubDate) return;
    const date = new Date(post.data.pubDate);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");

    if (!postsByDate.has(year)) {
      postsByDate.set(year, new Map<string, CollectionEntry<"blog">[]>());
    }

    const yearMap = postsByDate.get(year)!;
    if (!yearMap.has(month)) {
      yearMap.set(month, []);
    }

    yearMap.get(month)!.push(post);
  });

  return postsByDate;
}

/**
 * 为分页生成页面链接
 * @param totalPages 总页数
 * @returns 包含活动链接和隐藏链接的对象
 */
export function generatePageLinks(totalPages: number): {
  active: string[];
  hidden: string[];
} {
  if (
    !Number.isFinite(totalPages) ||
    !Number.isInteger(totalPages) ||
    totalPages < 0
  ) {
    throw new RangeError("totalPages must be a non-negative integer");
  }

  const pages = {
    active: [] as string[],
    hidden: [] as string[],
  };

  if (totalPages > 3) {
    pages.active.push("1", "...", totalPages.toString());
    for (let i = 2; i <= totalPages - 1; i++) {
      pages.hidden.push(i.toString());
    }
  } else {
    pages.active.push(
      ...Array.from({ length: totalPages }, (_, i) => (i + 1).toString()),
    );
  }

  return pages;
}

/**
 * 获取文章并添加阅读时间和字数统计
 * @param posts 文章集合
 * @returns 带有统计信息的文章集合
 */
export async function getPostsWithStats(
  posts: CollectionEntry<"blog">[],
): Promise<Post[]> {
  return posts.map((post) => {
    const rendered = (post as unknown as { rendered?: { html?: string } })
      .rendered;
    return {
      ...post,
      remarkPluginFrontmatter: computeReadingStats(rendered?.html ?? ""),
    } as Post;
  });
}
