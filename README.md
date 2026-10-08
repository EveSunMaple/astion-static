# Astion

> A Notion-powered static blog template built with Astro. Write micro-posts and long-form articles in a Notion database, get a fast static site with a Post feed, blog, tags, search and RSS.

[![license](https://badgen.net/github/license/EveSunMaple/astion-static)](./LICENSE)
[![Astro](https://img.shields.io/badge/Astro-7-BC52EE)](https://astro.build)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FEveSunMaple%2Fastion-static&env=NOTION_TOKEN,NOTION_DATA_SOURCE_ID&project-name=astion&repository-name=astion)

English | [简体中文](./README.zh-CN.md)

Demo: <https://demo.shuoshuo.saroprock.com>

## Features

- **Notion as CMS** — content comes from a Notion data source; publish without touching code
- **Two content types** — `Post` (micro-posts, shown as a feed on `/`) and `Blog` (list, tags, categories, archives under `/blog`)
- **Images localized at build time** — Notion-hosted files are downloaded and optimized by Astro, so the classic "URL expires in 1 hour" problem is gone
- **Rich rendering** — code highlighting (shiki), callouts, toggles, tables, to-dos, math, bookmarks
- **SEO ready** — sitemap, RSS, JSON-LD, OG image generation (satori)
- **Search & navigation** — Pagefind full-text search, pagination, tag/category/archive pages
- **Hardened output** — sanitized HTML and safe external links
- **Configurable** — theme, menus, social links and blog settings in `astion.config.yaml`

## Quick Start

Requirements: Node.js >= 22.12 and pnpm.

```sh
git clone --depth 1 https://github.com/EveSunMaple/astion-static.git astion
cd astion
pnpm install
cp .env.example .env
# fill in NOTION_TOKEN and NOTION_DATA_SOURCE_ID
pnpm dev
```

Then follow **[docs/notion-setup.zh-CN.md](./docs/notion-setup.zh-CN.md)** (Chinese) to create the Notion connection and database. In short you need:

1. A Notion internal connection → `NOTION_TOKEN`
2. A database with `Title / Slug / Type / Date / Tags / Category / Draft / Summary / Cover` → `NOTION_DATA_SOURCE_ID`, shared with the connection

## Deploy

Click the button above, or import the repository on any static host. Set the environment variables:

| Variable | Required | Description |
| --- | --- | --- |
| `NOTION_TOKEN` | yes | Notion internal connection token |
| `NOTION_DATA_SOURCE_ID` | yes | Notion data source id |
| `PUBLIC_SITE_URL` | no | Canonical site URL (config is read from `astion.config.yaml` too) |

The build fails fast when credentials are missing or Notion is unreachable, so a broken build never publishes an empty site.

## Auto rebuild

A static site has to be rebuilt when Notion content changes. The included workflow [`.github/workflows/schedule.yml`](./.github/workflows/schedule.yml) triggers a rebuild every 6 hours (and on manual dispatch) through a platform **Deploy Hook**.

Why a hook is needed and how to set it up (Vercel / Cloudflare / Netlify): see **[docs/deploy-and-schedule.zh-CN.md](./docs/deploy-and-schedule.zh-CN.md)** (Chinese).

## Commands

| Command | Action |
| --- | --- |
| `pnpm dev` | Start the dev server at `localhost:4321` |
| `pnpm build` | Type-check, build to `./dist/` and index search |
| `pnpm preview` | Preview the production build |
| `pnpm check` | Astro type-check |
| `pnpm test` | Run the Vitest suite |
| `pnpm lint` / `pnpm format` | Biome lint / format |

> If you change the Notion rehype pipeline, force a content refresh with `FORCE_RERENDER=1 pnpm exec astro sync --force` (the content cache is keyed by Notion `last_edited_time`).

## Project structure

```text
src/
├── content.config.ts    # Notion collection + schema transforms
├── plugins/             # rehype pipeline (sanitize, links, shiki, headings)
├── components/          # UI (cards, widgets, notion styles)
├── layouts/             # BaseLayout
├── pages/               # /, /post/[slug], /blog/*, /og/*, rss, robots
├── styles/              # global + notion block styles
└── utils/               # slug, sorting, reading stats
astion.config.yaml       # site & user configuration
```

## Credits

- Shell based on [Frosti](https://github.com/EveSunMaple/Frosti) (MIT © EveSunMaple and contributors)
- Notion loading and rendering powered by [`@astro-notion/loader`](https://github.com/astro-notion/notion-astro-loader) and `notion-rehype`

## License

[MIT](./LICENSE)
