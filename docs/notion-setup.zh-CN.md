# Notion 接入指南

本教程带你从零准备 Astion 需要的数据源。全部完成后，你会得到两样东西：

- `NOTION_TOKEN`：Notion 连接（Integration）的访问令牌
- `NOTION_DATA_SOURCE_ID`：内容数据库的 Data Source ID

> 适用版本：Astion v2（Astro 7 + Notion Content Layer）
> Notion 界面在 2025–2026 年把「Integrations」逐步改名为「Connections」，并在数据库之上引入了 Data Source 概念。若界面文字与本文略有差异，以你看到的为准，步骤本质相同。

---

## 5 分钟最短路径（TL;DR）

1. <https://www.notion.so/my-integrations> 新建连接 → 复制 token
2. 新建一个数据库 → 按第 2 节加上 9 个属性
3. 数据库右上角 `Share` → 把连接加进来
4. 数据库设置 → `Manage data sources` → `•••` → `Copy data source ID`
5. 写入 `.env`：`NOTION_TOKEN=...`、`NOTION_DATA_SOURCE_ID=...`
6. 重新构建站点

---

## 第 1 步：创建内部连接（Integration / Connection）

1. 打开 <https://www.notion.so/my-integrations>。
   - 也可以在 Notion 里走：`Settings（设置）→ Connections（连接）→ 开启 Developer Mode → personal access tokens → + New connection`。只有 Workspace Owner 能创建。
2. 点击 `+ New integration`（新版界面为 `+ New connection`）。
3. 填写：
   - `Name`：建议 `Astion`
   - `Associated workspace`：选择你的工作区
   - `Type`：`Internal`
4. 创建完成后，在详情页点击 `•••`（或 `Show`）复制 **Internal Integration Token**，形如 `ntn_xxx...`（旧版为 `secret_xxx...`）。
5. 能力（Capabilities）保持默认即可，本项目只需要 **Read content（读取内容）**。

> ⚠️ token 等同密码：只放在 `.env` 或部署平台的 Environment Variables 里，永远不要提交到 Git。

---

## 第 2 步：创建内容数据库

推荐使用**全页数据库**（便于管理）。

1. 在侧边栏新建一个页面，命名为 `Astion Blog`。
2. 在页面里输入 `/database`，选择 `Database` → `New empty database`（也可通过 `Get started with → ••• → Database → New empty database` 创建）。
3. 按下面的表格创建/重命名属性。Notion 中英界面属性名对照见括号。

| 属性名 | Notion 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `Title` | Title（标题） | 是 | 文章标题；建议把默认的 `Name` 重命名为 `Title` |
| `Slug` | Text（文本） | 否 | URL 标识，小写字母/数字/连字符；留空则按标题自动生成 |
| `Type` | Select（单选） | 是 | 选项固定为 `Post`、`Blog` 两个；大小写需一致 |
| `Date` | Date（日期） | 是 | 发布时间；列表排序、归档、RSS 均使用它 |
| `Tags` | Multi-select（多选） | 否 | 标签，多值 |
| `Category` | Select（单选） | 否 | 博客分类，单值 |
| `Draft` | Checkbox（复选框） | 是 | 勾选 = 草稿，不进入构建 |
| `Summary` | Text（文本） | 否 | 摘要，用于列表卡片与 SEO description，建议 50–160 字 |
| `Cover` | Files & media（文件与媒体） | 否 | 封面图，建议直接上传 |

### 类型说明

- **Post（说说）**：短动态，展示在首页信息流，详情页为 `/post/<slug>`。
- **Blog（博客）**：长文，列表页 `/blog`，详情页 `/blog/<slug>`，支持分类、标签、归档。

### 建议的三个视图（可选）

在数据库左上角 `+` 添加视图：

| 视图名 | 过滤条件 | 排序 |
| --- | --- | --- |
| `Published` | `Draft` 未勾选 | `Date` 降序 |
| `Posts` | `Type` = `Post` 且 `Draft` 未勾选 | `Date` 降序 |
| `Blogs` | `Type` = `Blog` 且 `Draft` 未勾选 | `Date` 降序 |

---

## 第 3 步：把数据库共享给连接

连接默认看不到任何页面，必须显式授权：

1. 打开刚创建的数据库页面。
2. 点击右上角 `Share`（或 `•••`）。
3. 在输入框中搜索第 1 步创建的连接名（如 `Astion`），点击添加（权限选 `Can read` 即可）。
4. 确认连接出现在 `Share` 列表中。

> 注意：把**数据库本身**（或其父页面）共享给连接才有效。只共享一个包含链接视图（Linked view）的页面是不够的——链接视图必须共享原始数据库。

---

## 第 4 步：获取 Data Source ID

Notion 新 API 中，**数据库（database）是容器，数据表（data source）才是真正的 schema**，构建要用 Data Source ID：

1. 打开数据库页面。
2. 点击右上角的设置图标（滑块样式）→ `Manage data sources`。
3. 点击数据源右侧的 `•••` → `Copy data source ID`。
4. 得到形如 `248104cd-477e-80af-bc30-000bd28de8f9` 的 ID。

**备选方法（API）**：URL 中 `?v=` 前面的 32 位字符串是 database ID（注意：**不是** data source ID），然后执行：

```bash
curl -s "https://api.notion.com/v1/databases/<DATABASE_ID>" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2025-09-03" | grep -A4 '"data_sources"'
```

响应里 `data_sources[].id` 即为所需 ID。

---

## 第 5 步：配置环境变量

在项目根目录：

```bash
cp .env.example .env
```

填入：

```dotenv
NOTION_TOKEN=ntn_你的token
NOTION_DATA_SOURCE_ID=你的_data_source_id
```

然后本地验证：

```bash
pnpm build
```

构建日志中若能看到内容条目数量、且 `src/assets/notion/` 出现下载的图片，即为成功。

---

## 内容写作规范

- **图片一律建议直接上传/粘贴到 Notion**。构建时 Astion 会把 Notion 托管的文件下载到本地（`src/assets/notion`）并交给 Astro 优化。直接引用外链图片也可以，但依赖对方站点可用性，且不会被本地化。
- **Cover（封面）推荐上传到 Notion**：会被下载、压缩并生成多尺寸资源；填外链 URL 也能显示，但不会本地化，且预览体验取决于对方站点。
- **Callout 和 Toggle 请使用 Notion 原生块**（`/callout`、`/toggle`），站点已内置对应样式；在普通段落里手写 `<details>` 只会作为文本显示。
- **Slug 发布后尽量不要修改**，否则旧链接会 404。
- **Tag 命名**保持稳定（如 `Astro` / `Notion` / `Life`），标签页按原文聚合。
- **代码块**请选择正确语言（Notion 代码块右上角选择），否则高亮会退化。
- 支持的块：段落、标题 1–3、无序/有序列表（含嵌套）、待办、引用、Callout、Toggle、代码块、图片、表格、分割线、书签、公式；其他类型会降级处理并在构建日志中提示。

---

## 常见问题

| 现象 | 原因与解决 |
| --- | --- |
| 构建报 401 / Unauthorized | token 错误或已失效：重新复制 token，更新 `.env` / 部署平台变量 |
| 构建报 `object_not_found` | 数据库没有共享给连接，或误把 database ID 当 data source ID 使用 |
| Notion 改了内容，网站没更新 | 静态站点需要重新构建：本地 `pnpm build`，或触发 CI（定时/手动 workflow） |
| 图片 403 / 裂图 | 旧版 Astion 直接引用了 1 小时过期的临时链接；v2 构建时会自动本地化。若仍出现，检查构建日志里图片下载是否失败 |
| 构建突然变快、条目变 0 | Notion 接口异常或限流，构建应直接失败而不是发布空站；检查日志中的报错 |
| 429 / rate limited | Notion 限流约 3 请求/秒：内容较多时降低构建频率，等待后重试 |
| 同一 Slug 冲突 | 手动指定唯一的 `Slug`；留空时系统会按标题生成，重名需人工调整 |

---

## 附：环境变量速查

| 变量 | 必填 | 来源 | 示例 |
| --- | --- | --- | --- |
| `NOTION_TOKEN` | 是 | 第 1 步连接详情页 | `ntn_xxxxxxxx` |
| `NOTION_DATA_SOURCE_ID` | 是 | 第 4 步数据源设置菜单 | `248104cd-477e-80af-bc30-000bd28de8f9` |

> 站点域名、标题、菜单等其它配置在根目录 `astion.config.yaml` 中修改。

---

## 相关文档

- [部署与自动重建（Deploy Hook 说明）](./deploy-and-schedule.zh-CN.md)
- [项目 README](../README.zh-CN.md)

