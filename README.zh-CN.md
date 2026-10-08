# Astion

> 基于 Astro 的 Notion 静态博客模板：在 Notion 数据库里写「说说」和长文，得到一个带说说流、博客、标签、搜索和 RSS 的快速静态站点。

[![license](https://badgen.net/github/license/EveSunMaple/astion-static)](./LICENSE)
[![Astro](https://img.shields.io/badge/Astro-7-BC52EE)](https://astro.build)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FEveSunMaple%2Fastion-static&env=NOTION_TOKEN,NOTION_DATA_SOURCE_ID&project-name=astion&repository-name=astion)

[English](./README.md) | 简体中文

Demo：<https://demo.shuoshuo.saroprock.com>

## 特性

- **Notion 即 CMS**：内容来自 Notion 数据源，发布内容不需要改代码
- **双形态内容**：`Post`（说说，首页信息流）与 `Blog`（长文，`/blog` 下有列表、标签、分类、归档）
- **图片构建期本地化**：Notion 托管文件会下载并经 Astro 优化，彻底避免"链接 1 小时过期"
- **渲染完整**：代码高亮（shiki）、Callout、Toggle、表格、待办、公式、书签
- **SEO**：sitemap、RSS、JSON-LD、OG 图自动生成（satori）
- **搜索与导航**：Pagefind 全文搜索、分页、标签/分类/归档页
- **安全输出**：HTML 经过清洗，外链自动加 `rel=noopener`
- **可配置**：主题、菜单、社交链接、博客设置都在 `astion.config.yaml`

## 快速开始

要求 Node.js >= 22.12 与 pnpm。

```sh
git clone --depth 1 https://github.com/EveSunMaple/astion-static.git astion
cd astion
pnpm install
cp .env.example .env
# 填入 NOTION_TOKEN 与 NOTION_DATA_SOURCE_ID
pnpm dev
```

然后按 **[docs/notion-setup.zh-CN.md](./docs/notion-setup.zh-CN.md)** 创建 Notion 连接与数据库，简单说需要：

1. Notion 内部连接（Connection）→ `NOTION_TOKEN`
2. 一个包含 `Title / Slug / Type / Date / Tags / Category / Draft / Summary / Cover` 的数据库，并共享给连接 → `NOTION_DATA_SOURCE_ID`

## 部署

点上方按钮，或把仓库导入任意静态托管平台。环境变量：

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `NOTION_TOKEN` | 是 | Notion 内部连接 token |
| `NOTION_DATA_SOURCE_ID` | 是 | Notion Data Source ID |
| `PUBLIC_SITE_URL` | 否 | 站点域名（站点信息也可在 `astion.config.yaml` 配置） |

凭证缺失或 Notion 接口异常时构建会直接失败，不会发布会一个空站。

## 自动重建

静态站点在 Notion 内容变化后需要重新构建。仓库内置的 [`.github/workflows/schedule.yml`](./.github/workflows/schedule.yml) 每 6 小时（也支持手动触发）通过平台的 **Deploy Hook** 触发一次重建。

**为什么要 hook、如何在 Vercel / Cloudflare / Netlify 配置：见 [docs/deploy-and-schedule.zh-CN.md](./docs/deploy-and-schedule.zh-CN.md)。**

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 本地开发（`localhost:4321`） |
| `pnpm build` | 类型检查 + 构建到 `./dist/` 并生成搜索索引 |
| `pnpm preview` | 预览构建产物 |
| `pnpm check` | Astro 类型检查 |
| `pnpm test` | 运行 Vitest 测试 |
| `pnpm lint` / `pnpm format` | Biome 检查 / 格式化 |

> 修改了 Notion 渲染管线（rehype 插件）后，需要执行 `FORCE_RERENDER=1 pnpm exec astro sync --force` 刷新内容层缓存（缓存键是 Notion 的 `last_edited_time`）。

## 目录结构

```text
src/
├── content.config.ts    # Notion collection 与字段转换
├── plugins/             # rehype 管线（sanitize / 外链 / shiki / 标题降级）
├── components/          # UI（卡片、组件、Notion block 样式）
├── layouts/             # BaseLayout
├── pages/               # /、/post/[slug]、/blog/*、/og/*、rss、robots
├── styles/              # 全局与 Notion block 样式
└── utils/               # slug、排序、阅读统计
astion.config.yaml       # 站点与用户配置
```

## 致谢

- 外壳基于 [Frosti](https://github.com/EveSunMaple/Frosti)（MIT © EveSunMaple 及其贡献者）
- Notion 数据加载与渲染：[`@astro-notion/loader`](https://github.com/astro-notion/notion-astro-loader) 与 `notion-rehype`

## 许可证

[MIT](./LICENSE)
