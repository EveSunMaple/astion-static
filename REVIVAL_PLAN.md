# Astion-static 复活评估与实施方案

> 撰写日期：2026-10-07
> 审计对象：`EveSunMaple/astion-static`（main @ 5f86cb2，最后提交 2025-01-17）
> 审计方式：本地克隆 → 安装依赖 → 构建 → 合成数据渲染验证 → 线上 Demo 验证 → 竞品与生态调研

---

## 0. 结论（先说答案）

**值得复活，但不建议继续修补现有代码，而应以约 2 周左右的业余时间做一次 v2 重写。**
当前仓库是一个完成度约 30% 的合格原型，架构方向（Astro 构建期抓取 Notion → 静态站点）成立，但已经踩中 Notion-as-CMS 的三个经典致命坑：**图片链接 1 小时后过期、富文本 XSS、构建失败静默发布空站**。继续沿 `roadmap` 手工打磨 block renderer，投入产出比会越来越低。

复活的**唯一充分理由**应该是：做一款「Frosti 的设计外壳 + Notion 数据源 + 说说/博客双形态」的差异化 Astro 模板，并愿意长期维护。如果只是「想用 Notion 写自己的博客」，直接用现成方案（otoyo/astro-notion-blog、NotionNext）更划算。

---

## 1. 原需求还原

从 README 历史、`about.astro` roadmap、旧 `Shuoshuo*` 组件和 Demo 可还原出完整意图：

| 维度 | 设想 |
| --- | --- |
| 定位 | 基于 Astro 的静态博客模板，内容源为 Notion（build 期抓取） |
| 内容形态 | **双形态**：`Post`（说说式短动态，Twitter 风格）+ 标准 `Blog` 长文 |
| 数据源 | Notion 父页面下的子页面，每个子页面 = 一篇内容；渲染段落/标题/列表/引号/图片/代码/待办/表格等 block |
| 功能 | 评论（Waline）、独立详情页、分页、标签、搜索、侧边栏/TOC、i18n、社交链接 |
| 产品化 | `astion.config.yaml` 配置化、一行命令 `create astro`、Vercel 部署 Demo |
| 命名 | 最初叫 `Shuoshuo`，Astro v5 重写后改名 `astion-static`（"Static version of Astion"，暗示还有一个动态版/SSR 版未公开） |

**核心差异化**：当时（2024）主流 Notion 博客方案只做「文章」，把「说说（短动态）+ 博客（长文）」统一放进一个静态站点，是真实存在但覆盖很少的需求。

---

## 2. 本次验证结果（事实层）

### 2.1 仓库与线上状态

- 仓库：MIT，创建于 2024-10-04，最后推送 2025-01-17；8 star / 2 fork / 0 open issue；未归档。
- 线上 Demo <https://demo.shuoshuo.saroprock.com> 仍然可访问，确实在实时渲染 Notion 内容（标题、表格、待办、代码高亮、嵌套列表均正常），但也确实只实现了「首页 Post 流」，`/blog` 是施工占位页。
- 作者同期的 `Frosti`（同设计语言、非 Notion 静态博客模板）已有 ~485 star，说明「渠道 + 审美」不是问题，问题是产品定位与维护成本。

### 2.2 本地构建验证

- `Node 26 + pnpm 11` 下直接 `pnpm build` **失败**：`ERR_PNPM_IGNORED_BUILDS`（esbuild/sharp/swup 等构建脚本未批准），Astro 的依赖检查会触发 `pnpm install` 并中断。绕过后台二进制可构建成功。
- `astro check`：0 error（部分畸形语法被 Astro 编译器容忍，见 §3.2）。
- 无 Notion 凭证时构建成功但输出空站点——`fetchPosts` 吞掉异常返回 `[]`（`src/services/notionAPI.ts:40-43`）。这是部署事故的温床。

### 2.3 渲染实测（合成 block + 线上 Demo 双重验证）

正常：段落、标题、加粗/斜体/下划线/删除线、链接、列表（含嵌套）、引用、待办、表格、Shiki 代码高亮、图片（外链）、锚点标题。

异常：
- 未转义的 `<script>` 被作为真实标签渲染进 HTML（实测），存在存储型 XSS。
- Notion 上传的图片/附件只存了临时 URL（`expiry_time`，见 `src/interface/post.ts:106-110`），线上 1 小时后必然 403。
- `Content.astro` 的 `end` 哨兵机制在列表与递归渲染下能跑通，但状态机脆弱（见下）。

---

## 3. 实现方案审核（按严重度）

### 3.1 致命问题（必须重做，不宜就地修）

1. **Notion 文件 URL 1 小时过期**
   Notion API 官方明确：`type: "file"` 的 URL 有效期 1 小时，且「不要静态引用，要重新拉取」。当前 `image.astro:4` 直接 `block.file.url` 写入 HTML，凡是拖拽上传到 Notion 的图片/PDF/封面，部署 1 小时后全部变成裂图。这是 Notion 静态站最经典的坑。
   **修法**：构建期把文件下载进 `src/assets/notion`（或 `public/notion-assets`），交给 Astro 图片管线；外链图片保留 URL 但走 `remotePatterns`/`<Image>`。

2. **富文本 XSS**
   `FormattedText.astro:39` 对 `plain_text` 直接 `set:html`，未做 HTML 转义与 sanitize；`href` 也未过滤 `javascript:`。任何 Notion 协作者/公开页内容都能注入脚本。
   **修法**：优先改用 `notion-rehype` 之类的 AST 渲染管线，并加 `rehype-sanitize`；至少也要转义文本、白名单 URL scheme。

3. **构建静默降级为空站**
   `fetchPosts` catch 后 `return []`。Notion key 缺失、限流、网络抖动都会导致「CI 绿、站点空」。模板类项目必须 fail-fast，或在 CI 中显式告警。

### 3.2 架构与正确性问题

4. **N+1 请求 + 无缓存**：每篇内容 `pages.retrieve` + 递归 `blocks.children.list`（`notionAPI.ts:22-61`），Notion 限流约 3 req/s。内容一多，构建时间线性膨胀且易触发 429。缺少 Content Layer / 本地缓存 / 重试。
5. **内容模型错误**：用「父页面 + 子页面」承载文章，导致无法有 `slug / 日期 / 标签 / 草稿 / 摘要 / 封面` 等元数据；`pubDate` 只能取 `created_time`（`notionAPI.ts:28`），排序只能按 Notion 手动顺序；`generateSlug`（`src/utils/utils.ts`）写了但没用，URL 直接是 UUID（`[slug].astro:9`）。正确姿势是用 **Notion Database + properties**。
6. **渲染覆盖不全**：`toggle / callout / column_list / divider / equation / embed / video / audio / file / bookmark / synced_block / link_to_page / mention / 行内 code / 颜色` 全部缺失或忽略；`interface/post.ts` 定义了但没实现。手写 renderer 的长尾会无限拖下去。
7. **`end` 哨兵 hack**：`notionAPI.ts:70-88` 往数据里注入假 block，`Content.astro` 用有状态 `switch` 消费，`end` 分支无 `break` 靠巧合落入 `paragraph`。嵌套列表/切换块一旦出现就易错，且污染了 `Block` 类型。
8. **畸形语法侥幸通过**：`Content.astro:71,74` 多写一个 `}`，被编译器解析成 `"}": true` 这样的垃圾 prop；`heading_1.astro:9` 用反引号裸写 `href`。当前能构建不代表语义正确。
9. **i18n 实际是坏的**：配置了 `astro-i18next`（`astro.config.mjs:6,43`）但没有 `astro-i18next.config`；翻译文件放在 `src/public/locales`（Astro 只认根目录 `public/`，永远不会被服务）；`BaseLayout.astro:11` 硬编码 `changeLanguage("en")`。
10. **主题配置不一致**：`astion.config.yaml` 写 `light/dark`，`BaseLayout.astro:23` 硬编码 `winter/dracula`，Navbar 的切换值用 `SITE_THEME.dark`，且没有任何代码写入 `localStorage`。
11. **Swup 与评论/脚本生命周期**：旧 `ShuoshuoComment.astro` 处理过 `swup:page:view` 重初始化的 Waline，重写时被删；当前 `ActionButtons` 三个按钮全是死 UI。Swup 本身也建议换成 Astro 原生 `ClientRouter`（Frosti 已这么做），少一个重依赖。
12. **SEO/输出质量**：OG 只有 `og:image`，缺 `og:title/description/url/type` 与 Twitter Card；无 RSS、无 404、无 robots；首页把全文内联展示同时又有详情页，内容重复。
13. **工程卫生**：`response_results.json` 调试残留（含 Notion 页面 ID）；空测试文件 `src/services/__test__/notionAPI.test.ts`；假依赖 `tailwind@^4.0.0`（不是 tailwindcss，纯多余）；未使用的 `astro-iconify`、`scss`、可能还有 `marked`；无 `.env.example`；README 只有 4 行，完全没说怎么配 Notion；pnpm 10+ 需要 `onlyBuiltDependencies` 白名单。
14. **发布链路缺失**：没有 CI/定时构建。用户在 Notion 写完并不能自动上线（Demo 是手动部署的），这是「当博客用」时的硬伤。

---

## 4. 更好的方案（v2 架构建议)

**总原则：把「Notion → 内容集合」交给社区成熟的 Content Layer Loader，把精力留给设计、双形态模型和产品化。**

### 4.1 技术选型

| 层 | 现状 | v2 建议 |
| --- | --- | --- |
| 框架 | Astro 5.1（2025-01） | 升级到当前 Astro 6/7 + Node 22+ |
| 内容接入 | 手写 `fetchPosts` + N+1 调用 | Astro Content Layer + 维护中的 Notion loader（如 `@astro-notion/loader` 及其活跃 fork；要求支持：Database/DataSource 查询、缓存、**下载 Notion 图片到本地**），锁定版本或 fork 自持 |
| Block 渲染 | 手写 11 个组件 + `end` 哨兵 | `notion-rehype` 输出 rehype AST，用 `<Content />` 统一渲染；仅在 callout/toggle 等需要定制时做组件覆盖 |
| 图片 | 直接引用临时 URL | loader 下载到 `src/assets/notion` + Astro `<Image>`；外链走 `remotePatterns` |
| 内容模型 | 父页面 + UUID 子页面 | Notion **Database**，属性：`Title / Slug / Type(post\|blog) / Date / Tags / Draft / Summary / Cover`，查询时 `filter Draft=false`、`sort Date desc` |
| 搜索 | 无 | Pagefind（Frosti 已实践） |
| 评论 | 曾用 Waline，被删 | Waline（作者自己在 Frosti 有教程和样式），`PUBLIC_WALINE_SERVER_URL`，`astro:page-load` 时重新 init |
| 过渡动画 | `@swup/astro` | Astro 原生 `ClientRouter`（View Transitions） |
| i18n | `astro-i18next` beta（坏） | Astro 原生 i18n + 简单字典；或砍掉，只保留界面文案配置 |
| 定时发布 | 无 | GitHub Actions `schedule` + `workflow_dispatch` → Vercel/Cloudflare Deploy Hook；建议 1–6 小时一次 |
| 安全 | `set:html` 裸奔 | `rehype-sanitize` + URL scheme 白名单 + `rel="noopener"` |
| 工程 | jest 空测试 / pnpm 缺白名单 | Vitest + 固定 Notion fixture 做渲染快照；Playwright 冒烟；`pnpm.onlyBuiltDependencies` |
| 复用 | 与 Frosti 平行维护 | 外壳（config、主题、布局、Pagefind、Waline 样式）尽量与 Frosti 同源，astion 只做「Notion 数据源 + 说说」增量 |

> 生态提醒：Notion loader 生态比较碎（原版 NotWoods、astro-notion/loader、多个 fork），且 Notion 官方 API 在 2025–2026 引入了 Data Source / File Upload 等变化。选型时优先「近 6 个月有提交、支持图片本地化、支持 database 查询」的版本，必要时自己维护一个薄 loader——这比手写整条渲染管线便宜得多。

### 4.2 信息架构

```
/                 → Post（说说）流，分页
/post/[slug]      → 说说详情（Waline 评论）
/blog             → 长文列表（分页 + 标签过滤 + 搜索）
/blog/[slug]      → 长文详情（TOC + 评论）
/tags/[tag]       → 标签聚合
/about            → 来自 Notion 单页或本地内容
/rss.xml, /404, sitemap, robots
```

### 4.3 发布闭环

Notion 编辑 → （定时/手动触发）GitHub Action → `pnpm build`（loader 增量拉取 + 图片本地化）→ Deploy Hook 发布。构建前用 zod 校验环境变量，缺失即红，禁止空站上线。

---

## 5. 复活路线图（建议排期，业余时间估算）

### Phase 0 — 止血与卫生（0.5–1 天）
- [ ] 升级工具链：Astro 6/7、Node 22+、pnpm `onlyBuiltDependencies` 白名单；删除假依赖 `tailwind`、`astro-iconify`、`scss` 等
- [ ] `fetchPosts` 改为 fail-fast；新增 `.env.example`（`NOTION_TOKEN`、`NOTION_DATA_SOURCE_ID`、`PUBLIC_WALINE_SERVER_URL`）
- [ ] 重写 README：5 分钟接入教程；删除 `response_results.json`、空测试文件
- [ ] 修复 i18n / 主题配置不一致 / localStorage 切换

### Phase 1 — 内容内核替换（3–5 天，核心）
- [ ] 建立 Notion Database 内容模型（属性见 §4.1），准备官方示例 Notion 模板
- [ ] 接入 Content Layer Notion loader + `notion-rehype`，删除手写 renderer 与 `end` 哨兵
- [ ] 图片/附件构建期本地化，接入 Astro 图片优化
- [ ] 路由：`/post/[slug]`、`/blog`、`/blog/[slug]`，真实 slug
- [ ] 渲染回归：用保存的 Notion JSON fixture 做 Vitest 快照（callout/toggle/columns/divider/mention 等）

### Phase 2 — 内容功能（3–5 天）
- [ ] 分页、标签、RSS、404、robots、完整 OG/Twitter/JSON-LD
- [ ] Pagefind 搜索；TOC 组件（替换硬编码 `TOCBar`）
- [ ] Waline 评论（含 ClientRouter 页面切换重新初始化）
- [ ] 首页「说说流」交互：点赞/评论数（Waline pageview）/分享（可用原生 Web Share API）

### Phase 3 — 产品化（2–3 天）
- [ ] GitHub Actions 定时 + 手动重建；Vercel/Cloudflare 一键 Deploy 按钮
- [ ] Demo 内容标准化（Notion 模板 + 截图）；中英文文档
- [ ] Playwright 冒烟测试（首页/详情/评论加载）
- [ ] 与 Frosti 的文档互链，发布公告（Frosti 的 485 star 渠道是最低成本的冷启动）

### Phase 4 — 运营（持续，低频）
- [ ] 跟踪 Notion API / Astro 大版本，季度升级；issue 响应；模板仓库保持「可一键复刻」

**MVP（只给自己用）**：Phase 0 + Phase 1 + 评论 ≈ 1 周。
**可发布模板**：Phase 0–3 ≈ 2–4 周业余时间。

### 决策检查点（Kill Criteria）
- 若两周内无法完成 Phase 1（说明低估 Notion 长尾）：转入「归档 + README 指向 otoyo/astro-notion-blog 或 NotionNext」。
- 若 3 个月内达不到约 50 star / 10 次 Deploy / 自己博客完成迁移中的任意一项：停止投入，保留 Demo 即可。
- 若目标只是「能用 Notion 写博客」且不想维护：**不要复活**，直接用现成方案。

---

## 6. 竞品与差异化（为什么 v2 仍有空间）

| 方案 | 技术 | 内容形态 | 短板 |
| --- | --- | --- | --- |
| otoyo/astro-notion-blog（~960★） | Astro + Notion，Cloudflare Pages | 只有文章 | 无说说流；需手动/CI 触发部署；主题朴素 |
| NotionNext（数 k★） | Next.js | 文章为主 | 重、非 Astro、静态导出体验一般 |
| 各类 notion-astro-loader | Astro Content Layer | 文章 | 是库不是成品；渲染/图片长尾自理 |
| **Astion v2（建议）** | Astro + Content Layer | **说说 + 博客双形态** | 需要作者持续维护；生态碎片化 |

差异化支点：`Frosti 级审美 + 双形态内容 + 一键部署 + 中英文文档 + Notion 模板`。这是现有竞品都没同时做到的组合。

---

## 7. 附：本次审计中的关键证据索引

| 问题 | 位置 |
| --- | --- |
| 图片临时 URL 直接输出 | `src/interface/post.ts:106-110`、`src/components/render/components/image.astro:4` |
| 富文本 XSS | `src/components/render/components/utils/FormattedText.astro:39` |
| 静默空构建 | `src/services/notionAPI.ts:40-43` |
| N+1 / 递归拉取 | `src/services/notionAPI.ts:22-61` |
| `end` 哨兵 hack | `src/services/notionAPI.ts:70-88` |
| `pubDate=created_time`、UUID slug | `src/services/notionAPI.ts:28`、`src/pages/post/[slug].astro:9` |
| 多余 `}` / 裸反引号属性 | `src/components/render/Content.astro:71,74`、`heading_1.astro:9` |
| i18n 失效 | `astro.config.mjs:43`、`src/layout/BaseLayout.astro:11`、`src/public/locales`（错误目录） |
| 主题不一致 | `astion.config.yaml:8-11` vs `BaseLayout.astro:23`、`Navbar.astro:73` |
| 占位/死代码 | `src/pages/blog.astro:14-19`、`ActionButtons.astro`、`TOCBar.astro`、空测试、`response_results.json` |
| 评论删除史 | `git show c510745^:src/components/ShuoshuoComment.astro` |
