# 部署与自动重建

## 为什么需要「定时重建 + Deploy Hook」

Astion 是**静态站点**：内容在**构建时**从 Notion 拉取并渲染成 HTML。这带来一个必须理解的前提：

- 你在 Notion 里改完内容，线上**不会自动更新**；
- Vercel / Cloudflare 这类平台只在 **git push**（或你手动点 Redeploy）时重新构建；
- Notion 的修改不会产生 git 提交，所以平台根本不知道要重新构建。

于是只有两条路：

| 方式 | 说明 | 适合 |
| --- | --- | --- |
| 手动重建 | 改完 Notion 去平台点一次 Redeploy，或到 GitHub Actions 手动触发 | 更新频率低 |
| 定时/自动重建 | 每 N 小时由 GitHub Actions 通知平台重新构建 | 想"写完就忘" |

**Deploy Hook** 就是第二条路里的那个"通知按钮"：平台（Vercel/Cloudflare/Netlify）给每个项目生成一个**带密钥的 URL**，向它发送一次 POST 请求，平台就会重新执行一次 `pnpm build`（重新拉取 Notion 内容并发布）。

> 结论：hook 不是必需品。没有它站点照样通过 git push 自动部署；有了它，Notion 内容更新才能自动上线。hook URL 等同于部署密码，**只能放进 GitHub Secret，绝不能提交到仓库**。

---

## 1. 获取 Vercel Deploy Hook

1. 打开 Vercel → 你的项目 → `Settings` → `Git` → `Deploy Hooks`
2. 点击 `Create Hook`：
   - Name：任意，例如 `notion-content`
   - Git Branch：`main`（与线上分支一致）
3. 创建后复制生成的 URL，形如：

   ```
   https://api.vercel.com/v1/integrations/deploy/prj_xxxxxxxx/yyyyyyyy
   ```

## 2. 配置 GitHub Secret

1. 打开 GitHub 仓库 → `Settings` → `Secrets and variables` → `Actions`
2. `New repository secret`
   - Name：`DEPLOY_HOOK_URL`
   - Secret：粘贴第 1 步的 URL
3. 保存

若地址泄露：回到 Vercel 删除该 hook 并重新创建，再更新 Secret 即可。

## 3. 工作流是怎么工作的

仓库内置 `.github/workflows/schedule.yml`：

- `schedule`：每 6 小时自动触发一次（cron `0 */6 * * *`，UTC 时间）
- `workflow_dispatch`：支持在 Actions 页面手动点一次（写完文章想立即上线时用）
- 实际动作只有一步：`curl -X POST "$DEPLOY_HOOK_URL"`，通知平台开始构建

注意两点：

1. 这个 workflow **只负责触发**。构建成功/失败要看 Vercel 项目 `Deployments` 里的日志；
2. 定时任务可以从写代码到上线有最长 6 小时的延迟，想立即发布就手动触发一次。

## 4. 换个平台怎么办

| 平台 | 获取方式 | 是否改动 |
| --- | --- | --- |
| Vercel | Settings → Git → Deploy Hooks | 直接用 |
| Cloudflare Pages | Settings → Builds & deployments → Deploy hooks | 直接用（curl 相同） |
| Netlify | Site configuration → Build & deploy → Build hooks | 直接用（curl 相同） |
| GitHub Pages | 无需 hook | 改为在 workflow 里 checkout + `pnpm build` + 上传产物部署 |

## 5. 发布节奏建议

- 内容多、构建慢：建议 6–24 小时一次，避免触到 Notion API 约 3 req/s 的限流；
- 想更勤：把 cron 改成 `0 * * * *`（每小时）；
- 完全不想定时：删掉 `schedule` 段，只保留手动触发。

## 6. 常见问题

- **Q：为什么 Notion 不能像 Git 一样自动触发构建？**
  A：Notion 没有面向静态站点、开箱即用的内容变更通知；搭建一个公网 webhook 接收服务成本更高，定时重建是性价比最高的方案。

- **Q：GitHub Actions 里定时任务没跑？**
  A：检查 Actions 是否启用、Secret 名是否为 `DEPLOY_HOOK_URL`；cron 使用 UTC；仓库 60 天无活动时 GitHub 会暂停定时任务，去 Actions 页面点一次启用即可。

- **Q：触发成功但页面没变化？**
  A：去平台构建日志确认是否真的执行了构建；若构建成功但内容旧，检查 Notion 页面是否被过滤（`Draft`、`Type` 为空、缺 `Date` 都不会发布）。

- **Q：构建把 Notion 打挂了会不会发布空站？**
  A：不会。构建失败时平台保留上一次成功版本；Astion 默认在凭证缺失/接口异常时让构建失败，而不是发布空站。
