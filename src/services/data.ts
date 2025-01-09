import type { Post } from "../utils/interfaces.ts";
import { fetchPosts } from "./notionAPI.mjs";

export const shuoshuos = await fetchPosts() as Post[];

/**
 * 根据 id 获取特定的 Post
 * @param id - 要查找的 Post 的 id
 * @returns {Post | undefined} - 返回匹配的 Post 或 undefined
 */
export function getPostById(id: string): Post | undefined {
  return shuoshuos.find(shuoshuo => shuoshuo.id === id);
}
