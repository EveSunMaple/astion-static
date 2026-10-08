# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/EveSunMaple/astion-static/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/EveSunMaple/astion-static/releases/tag/v2.0.0
