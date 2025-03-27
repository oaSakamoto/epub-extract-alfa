import { ResourcesMap } from "@/types/global";

export const processHtml = async (
  htmlFiles: ResourcesMap,
  cssProcessed: Map<string, string>,
  imagesProcessed: Map<string, string>,
) => {
  const html = htmlFiles.values().toArray();

  const docs: Promise<string>[] = html.map(async (blob: Blob) => {
    const htmlText = await blob.text();
    const parser = new DOMParser();
    const serializer = new XMLSerializer();

    const doc = parser.parseFromString(
      htmlText,
      blob.type as DOMParserSupportedType,
    );
    const links: HTMLCollectionOf<HTMLLinkElement> =
      doc.getElementsByTagName("link");
    const imgs: HTMLCollectionOf<HTMLImageElement> =
      doc.getElementsByTagName("img");
    Array.from(links).forEach((link) => {
      let href = link.getAttribute("href") as string;
      if (href.startsWith("../")) {
        href = href.substring(3);
      }
      const linkValue = "OEBPS/" + href;
      if (link.href !== "") link.href = cssProcessed.get(linkValue) as string;
    });
    Array.from(imgs).forEach((img) => {
      let src = img.getAttribute("src") as string;
      if (src.startsWith("../")) {
        src = src.substring(3);
      }
      const linkValue = "OEBPS/" + src;
      if (img.src !== "") img.src = imagesProcessed.get(linkValue) as string;
    });

    const parserErrorElement = doc.querySelector("parsererror");
    if (parserErrorElement) {
      throw Error("Teste");
    }
    return serializer.serializeToString(doc);
  });
  return Promise.all(docs);
};
