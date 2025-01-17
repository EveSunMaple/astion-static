import type { Post } from "../interface/notion";
import process from "node:process";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

/**
 * 获取 Notion 主页面中的子页面
 * @returns {Promise<Array<Post>>} 子页面数组
 */
export async function fetchPosts(): Promise<Array<Post>> {
  try {
    // 获取主页面的 ID 为根
    const parentPageId = process.env.NOTION_POST_PAGE_ID;
    if (!parentPageId) {
      throw new Error("NOTION_POST_PAGE_ID environment variable is not set.");
    }

    const response = await notion.blocks.children.list({ block_id: parentPageId });
    const posts: Array<Post> = [];

    for (const block of response.results as any) {
      if (block.type === "child_page") {
        const id = block.id;
        const page = await notion.pages.retrieve({ page_id: id }) as any;
        const title = page.properties.title?.title[0]?.plain_text || "untitled";
        const blocks = await getPageBlocks(id);
        const pubDate = page.created_time || new Date().toISOString();
        posts.push({
          id,
          title,
          blocks,
          pubDate,
        });
      }
    }

    return posts;
  }
  catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

/**
 * 获取页面内容，递归获取所有子块
 * @param {string} pageId - 子页面的ID
 * @returns {Promise<Array<object>>} 块数组
 */
async function getPageBlocks(pageId: string): Promise<Array<object>> {
  const params = { block_id: pageId } as any;
  const allBlocks: Array<object> = [];

  while (true) {
    const blocks = await notion.blocks.children.list(params) as any;
    for (const block of blocks.results) {
      block[block.type].children = [];
      if (block.has_children) {
        block[block.type].children = await getPageBlocks(block.id);
      }
      allBlocks.push(block);
    }
    if (!blocks.has_more) {
      break;
    }
    params.start_cursor = blocks.next_cursor;
  }

  // 标记列表的结束点（有点蠢，不知道有没有更好的方法）
  let isInList = false;
  for (let i = 0; i < allBlocks.length; i++) {
    const block = allBlocks[i] as any;
    if (block.type === "bulleted_list_item" || block.type === "numbered_list_item") {
      isInList = true;
    }
    else {
      if (isInList) {
        allBlocks.splice(i, 0, { type: "end" });
        isInList = false;
        i++;
      }
    }
  }
  if (isInList) {
    allBlocks.splice(allBlocks.length, 0, { type: "end" });
    isInList = false;
  }

  return allBlocks;
}
