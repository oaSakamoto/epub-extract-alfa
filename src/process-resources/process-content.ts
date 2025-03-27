export const processContent = async (blob: Blob) => {
  const parse = new DOMParser();
  const xmlDoc = parse.parseFromString(await blob.text(), "application/xml");
  let epubInfo = {};
  const itemsAttrMap: Map<string, string> = new Map();
  const spine: string[] = [];
  let coverImagePath;

  const parsererrorNS = xmlDoc.getElementsByTagName("parsererror")[0];
  if (parsererrorNS) {
    console.error("Erro ao fazer o parsing do XML", parsererrorNS);
  } else {
    function getTextContentNS(
      doc: XMLDocument,
      namespaceURI: string,
      localName: string,
    ) {
      const elements = doc.getElementsByTagNameNS(namespaceURI, localName);
      if (elements.length > 0) {
        return elements[0].textContent;
      }
      return null;
    }

    const dcNamespace = "http://purl.org/dc/elements/1.1/";

    epubInfo = {
      title: getTextContentNS(xmlDoc, dcNamespace, "title"),
      creator: getTextContentNS(xmlDoc, dcNamespace, "creator"),
      publisher: getTextContentNS(xmlDoc, dcNamespace, "publisher"),
      language: getTextContentNS(xmlDoc, dcNamespace, "language"),
      identifier: getTextContentNS(xmlDoc, dcNamespace, "identifier"),
    };

    const manifestElement = xmlDoc.querySelector("manifest");

    if (manifestElement) {
      const items = manifestElement.querySelectorAll("item");
      items.forEach((item) => {
        const idAttr = item.getAttribute("id");
        const hrefAttr = item.getAttribute("href");
        if (idAttr && hrefAttr) {
          itemsAttrMap.set(idAttr, `OEBPS/${hrefAttr}`);
        }
      });
    }

    const coverMeta = xmlDoc.querySelector("metadata meta[name='cover']");
    const coverId = coverMeta?.getAttribute("content");
    const manifestItem = xmlDoc.querySelector(`manifest item[id="${coverId}"]`);
    console.log(manifestItem);
    coverImagePath = manifestItem?.getAttribute("href") as string;

    if (manifestItem === null) {
      const coverItem = xmlDoc.querySelector(`manifest item[id="img_cover"]`);
      console.log(coverItem);
      if (coverItem) {
        coverImagePath = coverItem.getAttribute("href") as string;
      }
    }

    if (coverImagePath.startsWith("../")) {
      coverImagePath = coverImagePath.substring(3);
    }
    coverImagePath = "OEBPS/" + coverImagePath;

    const spineElement = xmlDoc.querySelector("spine");

    if (spineElement) {
      const itemrefs = spineElement.querySelectorAll("itemref");
      const idrefs: string[] = [];

      itemrefs.forEach((itemref) => {
        const idref = itemref.getAttribute("idref");
        if (idref) {
          idrefs.push(idref);
        }
      });

      idrefs.forEach((itemref) => {
        const id = itemsAttrMap.get(itemref);
        if (id) {
          spine.push(id);
        }
      });
    } else {
      console.log("\nElemento <spine> não encontrado.");
    }
  }
  return { epubInfo, spine, coverImagePath };
};
