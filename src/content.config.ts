import { defineCollection } from "astro:content";
import { notionLoader, notionPageSchema } from "@astro-notion/loader";
import {
  propertySchema,
  transformedPropertySchema,
} from "@astro-notion/loader/schemas";
import type { ImageMetadata } from "astro";
import { z } from "astro/zod";
import slugify from "slugify";

const coverAssets = import.meta.glob(
  "./assets/notion/**/*.{png,jpg,jpeg,webp,avif,gif}",
  {
    eager: true,
    import: "default",
  },
) as Record<string, ImageMetadata>;

interface NotionFileLike {
  type?: string;
  external?: { url?: string };
  file?: { url?: string };
}

function resolveSourceAsset(
  url: string | undefined,
): ImageMetadata | undefined {
  if (!url?.startsWith("src/")) return undefined;
  return coverAssets[`./${url.slice(4)}`];
}

function resolveCover(
  cover: NotionFileLike | null | undefined,
  files: NotionFileLike[] | undefined,
): string | ImageMetadata | undefined {
  const propertyFile = files?.[0];
  if (propertyFile) {
    if (propertyFile.type === "external") return propertyFile.external?.url;
    if (propertyFile.type === "file") {
      const url = propertyFile.file?.url ?? "";
      if (url.startsWith("http") || url.startsWith("/")) return url;
      return resolveSourceAsset(url) ?? url;
    }
  }

  if (cover?.type === "external") return cover.external?.url;
  if (cover?.type === "file") return resolveSourceAsset(cover.file?.url);
  return undefined;
}

const blog = defineCollection({
  loader: notionLoader({
    auth: import.meta.env.NOTION_TOKEN,
    data_source_id: import.meta.env.NOTION_DATA_SOURCE_ID,
    collectionName: "blog",
    imageSavePath: "assets/notion",
    publicPath: "public/notion-assets",
    cacheImageInData: true,
    filter: {
      and: [
        { property: "Draft", checkbox: { equals: false } },
        { property: "Type", select: { is_not_empty: true } },
      ],
    },
    sorts: [{ property: "Date", direction: "descending" }],
  }),
  schema: notionPageSchema({
    properties: z.object({
      Title: transformedPropertySchema.title,
      Slug: transformedPropertySchema.rich_text,
      Type: transformedPropertySchema.select,
      Date: transformedPropertySchema.date,
      Tags: transformedPropertySchema.multi_select,
      Category: transformedPropertySchema.select,
      Draft: transformedPropertySchema.checkbox,
      Summary: transformedPropertySchema.rich_text,
      Cover: propertySchema.files.optional(),
    }),
  }).transform((page) => {
    const properties = page.properties;
    return {
      ...page,
      title: properties.Title,
      slug:
        properties.Slug ||
        slugify(properties.Title, {
          lower: true,
          strict: true,
          replacement: "-",
        }),
      type: properties.Type ?? "Post",
      pubDate: properties.Date?.start,
      description: properties.Summary,
      draft: properties.Draft,
      categories: properties.Category ? [properties.Category] : [],
      tags: properties.Tags,
      badge: undefined as string | undefined,
      updated: undefined as Date | undefined,
      image: resolveCover(page.cover, properties.Cover?.files),
    };
  }),
});

export const collections = { blog };
