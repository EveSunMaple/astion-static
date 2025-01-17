import type { Post } from "../interface/post";
import { fetchPosts } from "./notionAPI";

// eslint-disable-next-line antfu/no-top-level-await
export const posts = await fetchPosts() as Post[];

/**
 * 根据 id 获取特定的 Post
 * @param id - 要查找的 Post 的 id
 * @returns {Post | undefined} - 返回匹配的 Post 或 undefined
 */
export function getPostById(id: string): Post | undefined {
  return posts.find(post => post.id === id);
}
