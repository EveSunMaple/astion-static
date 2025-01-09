import process from "node:process";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

/**
 * 获取 Notion 主页面中的子页面说说
 * @returns {Promise<Array<{title: string, blocks: Array<object>, pubDate: string}>>} 说说数组
 */
export async function fetchPosts() {
  try {
    const parentPageId = process.env.NOTION_SHUOSHUO_PAGE_ID;
    const response = await notion.blocks.children.list({
      block_id: parentPageId,
    });

    const shuoshuos = [];

    for (const block of response.results) {
      if (block.type === "child_page") {
        const id = block.id;
        const page = await notion.pages.retrieve({ page_id: id });
        const title = page.properties.title?.title[0]?.plain_text || "untitled";
        const blocks = await getPageBlocks(id);
        const pubDate = page.created_time || new Date().toISOString();

        // console.log(blocks);
        shuoshuos.push({
          id,
          title,
          blocks,
          pubDate,
        });
      }
    }

    return shuoshuos;
  }
  catch (error) {
    console.error("Error fetching shuoshuos:", error);
    return [];
  }
}

/**
 * 获取页面内容，递归获取所有子块
 * @param {string} pageId - 子页面的ID
 * @returns {Promise<Array<object>>} 块数组
 */
async function getPageBlocks(pageId) {
  const params = { block_id: pageId };
  const allBlocks = [];

  while (true) {
    const blocks = await notion.blocks.children.list(params);
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
    const block = allBlocks[i];

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
