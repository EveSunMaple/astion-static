# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Redesigned the whole site on the new Astion Theme v3 spec
  (`docs/design/theme.md`): strict 4/8px spacing rhythm, 680px reading
  measure shared by every page, fixed list columns (88px date), warm-neutral
  palette with a single `#0075de` accent, whisper borders, and one restrained
  page transition
- Removed daisyUI entirely: components now use a small semantic layer
  (`.button`, `.pill`, `.field`, `.side-link`, `.doc-row`, `.doc-tile`,
  dialog/pager/notice patterns) plus Tailwind tokens
- Fixed list/table-header alignment, sidebar ordering, footer spacing,
  mobile top bar, tag pills and Pagefind search initialization
- Removed dead helpers from `blogUtils` and unused components

### Added

- Initial page-load bridge (`app:page`) so components work without
  Astro View Transitions (Swup only emits events on navigation)

### Added

- Swup page transitions replacing Astro View Transitions: animated content
  container (`#swup`), persistent sidebar/top bar, hover/viewport preloading,
  progress bar and smooth scrolling, bridged through stable `app:page` /
  `app:before` events with idempotent component lifecycles
- Pagefind UI stylesheet is now bundled on the search page

### Changed

- Removed the Friends page and its menu entry
- Replaced the remaining emoji page icons with iconify icons
- Increased the typography scale (base 17px, larger list rows, meta text,
  sidebar/top bar/TOC labels)

- Layout overhaul: Notion workspace shell with a fixed full-height sidebar
  (collapsible on desktop, off-canvas on mobile), sticky top bar with
  breadcrumb, and a right-hand outline rail on wide screens
- Rebuilt About / Friends / Projects / 404 as Notion-style documents with
  bordered link tiles; removed the Frosti MDX card components
- Blog list gains a database-style header row; detail pages show Notion page
  icons (emoji) and covers
- Visual redesign: replaced the Frosti look with a Notion-like design system
  (custom `notion` / `notion-dark` daisyUI themes, Notion typography, page
  headers, document-style list rows, subtle borders instead of cards/shadows)
- Post/blog lists are now document rows with date column, cover thumb and
  muted tag pills; detail pages use Notion page typography and block styles
  (callouts, toggles, code, tables, to-dos)
- Sidebar, navbar, search, TOC, pagination, footer and share dialog restyled

## [2.0.1] - 2026-10-08

### Fixed

- CI audit failures: patched transitive advisories via pnpm overrides
  (axios, form-data, glob, minimatch, brace-expansion, source-map-js) and
  documented the advisories without a published fix
- CI now passes Notion secrets to the pipeline and skips typecheck/build
  gracefully when they are absent (forks/PRs)
- Notion credentials can come from `process.env` so CI/Vercel env vars work

## [2.0.0] - 2026-10-08

### Added

- Notion data source as the content backend via `@astro-notion/loader`
- Post (说说) feed at `/` with detail pages at `/post/[slug]`
- Blog routes: paginated list, tags, categories, archives and Pagefind search
- Build-time download and optimization of Notion-hosted images (no more expiring URLs)
- rehype pipeline: sanitize whitelist, external link hardening, shiki code highlighting,
  heading shift to avoid duplicate `h1`
- `CoverImage` component handling both external and Notion-hosted covers
- RSS, sitemap, robots.txt, satori OG images and a 404 page
- Vitest suite and a scheduled rebuild workflow using a platform deploy hook
- Documentation: Notion setup, deploy & schedule, contributing, security

### Changed

- Rewritten on Astro 7 with the Frosti v4 shell (Tailwind/daisyUI, Biome, Pagefind)
- Configuration lives in `astion.config.yaml`; content schema in `src/content.config.ts`
- Reading stats are computed from rendered HTML instead of a markdown remark plugin

### Removed

- v1 hand-rolled Notion block renderer (`src/services`, `src/components/render`)
- Markdown sample content and the jest/eslint toolchain

[Unreleased]: https://github.com/EveSunMaple/astion-static/compare/v2.0.1...HEAD
[2.0.1]: https://github.com/EveSunMaple/astion-static/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/EveSunMaple/astion-static/releases/tag/v2.0.0
