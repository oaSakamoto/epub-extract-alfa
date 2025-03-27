import { describe, it, expect } from "vitest";
import { Blob } from "buffer";
import {
  processContainer,
  validateContainerPresence,
  parseContainerXml,
  validateContainerStructure,
  validateRootFilesElement,
  validateRootFileAttributes,
} from "../../src/process-resources/process-container";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
global.Blob = Blob;

describe("Container Processing", () => {
  const mockResourcesMap = (containerBlob?: Blob) => {
    const map = new Map<string, Blob>();
    if (containerBlob) {
      map.set("META-INF/container.xml", containerBlob);
    }
    return map;
  };

  const createMockBlob = (textContent: string, type: string = "text/xml") => {
    return new Blob([textContent], { type });
  };

  describe("validateContainerPresence", () => {
    it("should return container Blob if present and valid", () => {
      const blob = createMockBlob("<xml></xml>");
      const xmlMap = mockResourcesMap(blob);
      expect(validateContainerPresence(xmlMap)).toBe(blob);
    });

    it("should throw NO_CONTAINER_FILE error if container.xml is missing", () => {
      const xmlMap = mockResourcesMap();
      expect(() => validateContainerPresence(xmlMap)).toThrowError(
        "[NO_CONTAINER_FILE] EPUB container missing required META-INF/container.xml",
      );
    });

    it("should throw INVALID_CONTAINER_FILE error if container.xml is not a Blob", () => {
      const xmlMap = new Map<string, string>();
      xmlMap.set("META-INF/container.xml", "not a blob");
      expect(() => validateContainerPresence(xmlMap)).toThrowError(
        "[INVALID_CONTAINER_FILE] Invalid container in META-INF/container.xml",
      );
    });
  });
  describe("parseContainerXml", () => {
    it("should parse valid container XML Blob to Document", async () => {
      const xmlBlob: Blob = createMockBlob(
        "<container><rootfiles></rootfiles></container>",
      );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const doc = await parseContainerXml(xmlBlob);

      //expect(doc).toBeInstanceOf(XMLDocument);
      expect(doc.documentElement.nodeName).toBe("container");
    });

    it("should throw MALFORMED_XML error for invalid XML", async () => {
      const invalidXmlBlob = createMockBlob("<container><rootfiles");
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      await expect(parseContainerXml(invalidXmlBlob)).rejects.toThrowError(
        "[MALFORMED_XML] Error parsing XML in META-INF/container.xml: [MALFORMED_XML] Malformed XML in META-INF/container.xml: 1:21: unclosed tag: container",
      );
    });
  });

  describe("validateContainerStructure", () => {
    it("should return rootfiles element for valid structure", async () => {
      const xmlBlob = createMockBlob(
        "<container><rootfiles></rootfiles></container>",
      );
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        (await xmlBlob.text()) as string,
        "application/xml",
      );
      expect(validateContainerStructure(doc).nodeName).toBe("rootfiles");
    });

    it("should throw INVALID_CONTAINER_STRUCTURE error if root element is not container", async () => {
      const xmlBlob = createMockBlob(
        "<notContainer><rootfiles></rootfiles></notContainer>",
      );
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        (await xmlBlob.text()) as string,
        "application/xml",
      );
      expect(() => validateContainerStructure(doc)).toThrowError(
        "[INVALID_CONTAINER_STRUCTURE] Missing root < container > element in META-INF/container.xml",
      );
    });

    it("should throw MISSING_ROOTFILES error if rootfiles element is missing", async () => {
      const xmlBlob = createMockBlob("<container></container>");
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        (await xmlBlob.text()) as string,
        "application/xml",
      );
      expect(() => validateContainerStructure(doc)).toThrowError(
        "[MISSING_ROOTFILES] Missing required < rootfiles > element in META-INF/container.xml",
      );
    });
  });

  describe("validateRootFilesElement", () => {
    it("should return the rootfile element if only one exists", async () => {
      const xmlBlob = createMockBlob(
        '<container><rootfiles><rootfile full-path="test.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
      );
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        (await xmlBlob.text()) as string,
        "application/xml",
      );
      const rootfiles = doc.querySelector("rootfiles")!;
      expect(validateRootFilesElement(rootfiles).nodeName).toBe("rootfile");
    });

    it("should throw MISSING_ROOTFILE error if no rootfile elements", async () => {
      const xmlBlob = createMockBlob(
        "<container><rootfiles></rootfiles></container>",
      );
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        (await xmlBlob.text()) as string,
        "application/xml",
      );
      const rootfiles = doc.querySelector("rootfiles")!;
      expect(() => validateRootFilesElement(rootfiles)).toThrowError(
        "[MISSING_ROOTFILE] Missing required < rootfile > element in META-INF/container.xml",
      );
    });

    it("should throw MULTIPLE_ROOTFILES error if more than one rootfile element", async () => {
      const xmlBlob = createMockBlob(
        '<container><rootfiles><rootfile full-path="test.opf" media-type="application/oebps-package+xml"/><rootfile full-path="test2.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
      );
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        (await xmlBlob.text()) as string,
        "application/xml",
      );
      const rootfiles = doc.querySelector("rootfiles")!;
      expect(() => validateRootFilesElement(rootfiles)).toThrowError(
        "[MULTIPLE_ROOTFILES] Multiples rootfiles found(2) - only one supported",
      );
    });
  });

  describe("validateRootFileAttributes", () => {
    it("should return full-path attribute if valid attributes", async () => {
      const xmlBlob = createMockBlob(
        '<container><rootfiles><rootfile full-path="test.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
      );
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        (await xmlBlob.text()) as string,
        "application/xml",
      );
      const rootfile = doc.querySelector("rootfile")!;
      expect(validateRootFileAttributes(rootfile)).toBe("test.opf");
    });

    it("should throw MISSING_FULL_PATH error if full-path attribute is missing", async () => {
      const xmlBlob = createMockBlob(
        '<container><rootfiles><rootfile media-type="application/oebps-package+xml"/></rootfiles></container>',
      );
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        (await xmlBlob.text()) as string,
        "application/xml",
      );
      const rootfile = doc.querySelector("rootfile")!;
      expect(() => validateRootFileAttributes(rootfile)).toThrowError(
        "[MISSING_FULL_PATH] Rootfile missing required full-path attribute",
      );
    });

    it("should throw MISSING_MEDIA_TYPE error if media-type attribute is missing", async () => {
      const xmlBlob = createMockBlob(
        '<container><rootfiles><rootfile full-path="test.opf"/></rootfiles></container>',
      );
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        (await xmlBlob.text()) as string,
        "application/xml",
      );
      const rootfile = doc.querySelector("rootfile")!;
      expect(() => validateRootFileAttributes(rootfile)).toThrowError(
        "[MISSING_MEDIA_TYPE] Rootfile missing required media-type attribute",
      );
    });

    it("should throw INVALID_MEDIA_TYPE error if media-type is incorrect", async () => {
      const xmlBlob = createMockBlob(
        '<container><rootfiles><rootfile full-path="test.opf" media-type="wrong-type"/></rootfiles></container>',
      );
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        (await xmlBlob.text()) as string,
        "application/xml",
      );
      const rootfile = doc.querySelector("rootfile")!;
      expect(() => validateRootFileAttributes(rootfile)).toThrowError(
        "[INVALID_MEDIA_TYPE] Invalid rootfile media - type: wrong-type",
      );
    });
  });

  describe("processContainer", () => {
    it("should successfully process a valid container.xml and return root file path", async () => {
      const xmlContent = `
        <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
          <rootfiles>
            <rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/>
          </rootfiles>
        </container>
      `;
      const xmlBlob = createMockBlob(xmlContent);
      const xmlMap = mockResourcesMap(xmlBlob);
      const rootFilePath = await processContainer(xmlMap);
      expect(rootFilePath).toBe("EPUB/package.opf");
    });

    it("should throw UNEXPECTED_ERROR if any step fails during processing", async () => {
      const xmlMap = mockResourcesMap(); // Missing container.xml, will cause validateContainerPresence to fail
      await expect(processContainer(xmlMap)).rejects.toThrowError(
        "[UNEXPECTED_ERROR] Unexpected error processing container: [NO_CONTAINER_FILE] EPUB container missing required META-INF/container.xml",
      );
    });
  });
});
