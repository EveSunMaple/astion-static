# Astion v2 执行计划

> 状态：Phase 0 ✅、Phase 1 ✅、Phase 2 ✅，准备进入 Phase 3 · 最后更新：2026-10-08
> 审计报告见 [REVIVAL_PLAN.md](./REVIVAL_PLAN.md)，Notion 接入教程见 [docs/notion-setup.zh-CN.md](./docs/notion-setup.zh-CN.md)

## 目标与决策记录

- **目标**：把 astion-static 从「30% 原型」重构为可发布的 Astro 7 + Notion 模板，保留「说说（Post）+ 博客（Blog）」双形态差异化。
- **路线**：Astro 7 + Notion Content Layer（数据库模型）+ Frosti v4 外壳复用。
- **范围**：完整模板产品化；评论暂不做（预留接口）。
- **D1 许可证（已定：MIT）**：复核 Frosti 的 LICENSE 原文与 GitHub 检测均为 MIT（package.json 字段标的 GPL-3.0 是笔误），MIT 代码可直接复用到 MIT 的 astion，保留版权声明即可。备注：可在方便时顺手修正 Frosti 的 package.json license 字段。

## 前置准备（Phase 1 前完成）

- [x] Notion 创建内部连接并拿到 `NOTION_TOKEN`（教程：`docs/notion-setup.zh-CN.md`）
- [~] 按教程创建数据库（Title / Slug / Type / Date / Tags / Category / Draft / Summary / Cover）— 待修正：title 属性仍是 `Name`，多建了一个 rich_text 的 `Title`；两条空行待填/删
- [x] 数据库共享给连接，拿到 `NOTION_DATA_SOURCE_ID`
- [x] 确认 D1 许可证选择（MIT）

## Phase 0 — 立项基线（已完成 2026-10-08）

- [x] 从 `main` 切出 `v2` 分支，main 保持现 Demo 不动
- [x] 移植 Frosti v4 外壳：config / layouts / components / widgets / pages 骨架 / i18n / integration / tailwind + daisyUI / biome / CI
- [x] `package.json` 对齐 Frosti v4（Astro 7.3.6、Node >=22.12、pnpm@11.8.0、pagefind、@astrojs/rss、expressive-code、satori），补 `allowBuilds` / `onlyBuiltDependencies`（含 sharp）
- [x] 删除旧物：`src/services/**`、`src/interface/post.ts`、`src/components/render/**`、jest、eslint、`response_results.json`、假依赖 `tailwind`
- [x] `.env.example`（`NOTION_TOKEN`、`NOTION_DATA_SOURCE_ID`）
- [x] 验收：`pnpm install` / `pnpm check` / `pnpm biome:check` / `pnpm build`（26 页 + Pagefind 索引）全部通过
- [x] 偏差说明：配置改名 `astion.config.yaml`；版本号 `2.0.0-dev`；暂保留 Frosti 示例文章用于验证外壳（Phase 1 移除）；修掉 Frosti `check-all`/CI 中不存在的 `astro-check` 脚本引用

## Phase 1 — Notion 接入冒烟 Spike（已完成 2026-10-08）· 决策门 A ✅

- [x] `src/content.config.ts` 接入 `@astro-notion/loader@2.0.0-beta.3`（注意：npm `latest` 仍是旧的 1.1.2，旧 API；2.x beta 才支持 `data_source_id` 与 Astro 6/7）
- [x] 验证：属性读取 ✅ / `render()` 输出 ✅（H1-H3、段落、粗体/链接、有序/无序列表含嵌套、待办、引用、表格、分割线全部正确）/ 图片本地化 ✅（`src/assets/notion/**` + Astro 转 WebP）/ 二次 sync 跳过重渲染 ✅
- [x] **决策门 A 通过**：无需更换 loader 或自研
- [x] 产出：`src/content.config.ts` 中 `notion` collection；`astro.config.mjs` 增加 `remotePatterns` + sharp `limitInputPixels: false`
- [x] 遗留问题（转 Phase 3）：toggle 渲染为转义文本（非 `<details>`）；callout 输出 `[!NOTE]/[!WARNING]` 需样式映射；代码块无高亮（expressive-code 不处理 loader HTML）；外链无 `target/rel`（可用 loader `rehypePlugins` 接 `rehype-external-links` + `rehype-sanitize`）
- [x] 其他：`src/assets/notion/` 已加入 `.gitignore`（内容层生成的缓存产物）

## Phase 2 — 内容层与路由（已完成 2026-10-08）

- [x] zod schema（`notionPageSchema` + `transformedPropertySchema`）：Title/Slug/Type/Date/Tags/Category/Draft/Summary/Cover → 统一成 Frosti 兼容字段（`title/description/pubDate/draft/categories/tags/image/type/slug`）
- [x] 工具：slug（空则 slugify，再退回 page id；重复 slug 构建报错）、日期排序、tags/categories/archives 分组、reading time（从渲染 HTML 估算）
- [x] 路由全部产出：`/`（说说流）、`/post/[slug]`、`/blog` 分页列表、`/blog/[slug]`、`/blog/tags`、`/blog/tag/[tag]`、`/blog/categories`、`/blog/category/[category]`、`/blog/archives`、`/blog/search`、`/about`、`404`、`rss.xml`、`robots.txt`、`og/[slug].png`
- [x] Cover 与正文图片统一走 Astro `<Image>`（正文图片已验证本地化；Cover 逻辑已实现但测试数据尚未设置封面，待验证）
- [x] 验收：`pnpm check` / `pnpm biome:check` / `pnpm build`（14 页 + Pagefind）全绿；`rg "amazonaws|notion-static" dist --include=*.html` 无结果
- [x] 清理：删除 Frosti 示例 Markdown；旧的 `blogUtils`/`paginationUtils` 已迁移到 Notion 数据源（collection 名暂沿用 `blog`，Phase 4 可重命名为 `notion`）
- [ ] 待办（转 Phase 3）：详情页 Notion 正文 H1 与页面标题重复（SEO）；Cover 封面实测

## Phase 3 — 渲染正确性与安全（1–2 天）· 决策门 B

- [ ] rich text：加粗/斜体/下划线/删除线/行内 code/链接/颜色/mention/公式
- [ ] `rehype-sanitize` + 链接 `rel="noopener"` + `rehype-external-links`
- [ ] 未知 block 降级 + 构建告警；API 失败 fail-fast
- [ ] 代码高亮方案定稿（loader HTML 与 expressive-code 不兼容时用 shiki rehype 桥接）
- [ ] Vitest fixture 快照（主要 block + XSS 用例）
- [ ] **决策门 B**：渲染覆盖 ≥90% 常用 block 且 XSS 用例全过

## Phase 4 — 产品化（2–3 天）

- [ ] GitHub Actions：PR `check + build`；`schedule` + `workflow_dispatch` → Vercel Deploy Hook（1–6h）
- [ ] README（EN）+ `README.zh-CN` + 一键 Deploy 按钮 + 接入教程互链
- [ ] Demo 切换到新 Notion 示例库；补截图
- [ ] CHANGELOG、tag、issue/PR 模板（复用 Frosti）、CONTRIBUTING
- [ ] 验收：新账号照文档 10 分钟跑通；手动触发定时构建成功

## Phase 5 — 发布（0.5 天）

- [ ] 合并 `v2` → main，tag `v2.0.0`
- [ ] 更新仓库 description / homepage；Frosti README 与讨论区互链公告
- [ ] 记录维护节奏：季度检查 Notion API / Astro / loader 升级

## 风险与预案

| 风险 | 预案 |
| --- | --- |
| loader 生态碎片化、实验性 | Phase 1 决策门；自研薄 loader 兜底（约 +2 天） |
| Notion API 漂移（Data Source / File Upload） | 锁定 SDK 与 loader 版本，fixture 回归 |
| 大库 3 req/s 限流、构建慢 | loader 缓存 + 控制示例库规模；必要时分页增量 |
| GPL-3.0 与 MIT 冲突 | 默认整体 GPL-3.0；必须 MIT 则放弃复制 Frosti |
| satori 中文字体、构建时间 | OG 先英文字体或延后 v2.1 |

**总工期**：约 7–10 个工作日（业余约 2 周）；MVP 可用点在第 4–5 天（Phase 2 结束）。

## 交付物

- `PLAN.md`（本文件）
- `docs/notion-setup.zh-CN.md`（用户教程，本阶段先行产出）
- v2 分支：可构建的 Astro 7 + Notion 模板
- README（EN/zh）、Notion 模板说明、CI 与定时发布
- `v2.0.0` tag 与公告
