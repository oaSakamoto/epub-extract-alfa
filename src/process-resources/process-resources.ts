import { ResourcesCategories, ResourcesMap } from "@/types/global";
import { MIME_TYPES_MAP } from "@/unpack/config";
import { processContainer } from "./process-container";
import { processAssets } from "./process-assets";
import { processContent } from "./process-content";
import { processHtml } from "./process-html";

enum MimeKeys {
  HTML = "html",
  CSS = "css",
  JPEG = "jpeg",
  JPG = "jpg",
  PNG = "png",
  XML = "xml",
  XHTML = "xhtml",
  OPF = "opf",
  NCX = "ncx",
}

const createResourcesHandler =
  (targetMap: ResourcesMap) => (key: string, value: Blob) =>
    targetMap.set(key, value);

const MIME_TYPES = {
  HTML: MIME_TYPES_MAP.get(MimeKeys.HTML)!,
  CSS: MIME_TYPES_MAP.get(MimeKeys.CSS)!,
  JPEG: MIME_TYPES_MAP.get(MimeKeys.JPEG)!,
  JPG: MIME_TYPES_MAP.get(MimeKeys.JPG)!,
  PNG: MIME_TYPES_MAP.get(MimeKeys.PNG)!,
  XML: MIME_TYPES_MAP.get(MimeKeys.XML)!,
  XHTML: MIME_TYPES_MAP.get(MimeKeys.XHTML)!,
  OPF: MIME_TYPES_MAP.get(MimeKeys.OPF)!,
  NCX: MIME_TYPES_MAP.get(MimeKeys.NCX)!,
};

export const processResources = async (epubResourcesMap: ResourcesMap) => {
  const resourcesCategories: ResourcesCategories = {
    css: new Map() as ResourcesMap,
    html: new Map() as ResourcesMap,
    images: new Map() as ResourcesMap,
    xml: new Map() as ResourcesMap,
    xhtml: new Map() as ResourcesMap,
    opf: new Map() as ResourcesMap,
    ncx: new Map() as ResourcesMap,
  };

  const handlers = {
    html: createResourcesHandler(resourcesCategories.html),
    css: createResourcesHandler(resourcesCategories.css),
    images: createResourcesHandler(resourcesCategories.images),
    xml: createResourcesHandler(resourcesCategories.xml),
    opf: createResourcesHandler(resourcesCategories.opf),
    ncx: createResourcesHandler(resourcesCategories.ncx),
  };

  const mimeTypeHandleMap = new Map<string, (key: string, value: Blob) => void>(
    [
      [MIME_TYPES.HTML, handlers.html],
      [MIME_TYPES.XHTML, handlers.html],
      [MIME_TYPES.CSS, handlers.css],
      [MIME_TYPES.JPEG, handlers.images],
      [MIME_TYPES.JPG, handlers.images],
      [MIME_TYPES.PNG, handlers.images],
      [MIME_TYPES.XML, handlers.xml],
      [MIME_TYPES.OPF, handlers.opf],
      [MIME_TYPES.NCX, handlers.ncx],
    ],
  );

  epubResourcesMap.forEach(async (value, key) => {
    const handler = mimeTypeHandleMap.get(value.type);
    handler?.(key, value);
  });

  const spineWithBlob = new Map<string, Blob>();

  const contentPath = await processContainer(resourcesCategories.xml);
  const { epubInfo, spine, coverImagePath } = await processContent(
    resourcesCategories.opf.get(contentPath) as Blob,
  );

  const { cssProcessed, imagesProcessed } = await processAssets(
    resourcesCategories.css,
    resourcesCategories.images,
  );

  spine.forEach((key) => {
    spineWithBlob.set(key, resourcesCategories.html.get(key) as Blob);
  });

  const htmlProcessed = await processHtml(
    spineWithBlob,
    cssProcessed,
    imagesProcessed,
  );
  const coverImage = imagesProcessed.get(coverImagePath as string);

  return { epubInfo, spine, htmlProcessed, coverImage };
};
