import { describe, expect, it } from "vitest";
import {
  EPUB_DEFAULTS,
  getFileExtension,
  getMimeType,
  MIME_TYPES_MAP,
} from "../../src/unpack/config.ts";
import { Entry } from "@zip.js/zip.js";

describe("EPUB_DEFAULTS", () => {
  it("should have correct size limits", () => {
    expect(EPUB_DEFAULTS.maxFileSize).toBe(50 * 1024 * 1024);
    expect(EPUB_DEFAULTS.minFileSize).toBe(1);
  });
  it("should include required container entry", () => {
    expect(EPUB_DEFAULTS.requiredEntries).toContain("META-INF/container.xml");
  });
});
describe("MYME_TYPE_MAP", () => {
  it("should contain common EPUB extensions", () => {
    expect(MIME_TYPES_MAP.get("html")).toBe("text/html");
    expect(MIME_TYPES_MAP.get("opf")).toBe("application/oebps-package+xml");
  });

  it("should default unknown extensions to octest-stream", () => {
    expect(MIME_TYPES_MAP.get("unknown")).toBeUndefined();
  });
});

describe("getFileExtensions from filenames", () => {
  it("should extract extensions from filenames", () => {
    expect(getFileExtension("chapter1.xhtml")).toBe("xhtml");
    expect(getFileExtension("image.PNG")).toBe("png");
  });

  it("should return undefined for extensionless files", () => {
    expect(getFileExtension("README")).toBeUndefined();
  });

  it("should handle mutiple dots in filenames", () => {
    expect(getFileExtension("archive.tar.gz")).toBe("gz");
  });
});

describe("getMimeType", () => {
  const mockEntry = (filename: string): Entry => ({ filename }) as Entry;
  it("should detect directories", () => {
    const entry = mockEntry("texts/");
    expect(getMimeType(entry)).toBe("directory");
  });

  it("should resolve known MIME types", () => {
    expect(getMimeType(mockEntry("styles.css"))).toBe("text/css");
    expect(getMimeType(mockEntry("image.jpg"))).toBe("image/jpeg");
  });
  it("should default to octet-stream for unknown types", () => {
    expect(getMimeType(mockEntry("data.bin"))).toBe("application/octet-stream");
    expect(getMimeType(mockEntry("file.unknown"))).toBe(
      "application/octet-stream",
    );
  });
});
