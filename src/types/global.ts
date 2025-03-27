/* v8 ignore start */
import { EPUB_DEFAULTS } from "@/unpack/config";

export type EpubConfig = typeof EPUB_DEFAULTS;
export type ResourcesMap = Map<string, Blob>;

export type ResourcesCategories = {
  css: ResourcesMap;
  html: ResourcesMap;
  images: ResourcesMap;
  xml: ResourcesMap;
  xhtml: ResourcesMap;
  opf: ResourcesMap;
  ncx: ResourcesMap;
};
