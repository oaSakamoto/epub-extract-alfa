import { describe, expect, it } from "vitest";
import {
  validateEpubFile,
  validateEpubStructure,
} from "../../src/unpack/validators";
import { ERROR_CODES } from "../../src/unpack/erros";
import { EPUB_DEFAULTS } from "../../src/unpack/config";
import { Entry } from "@zip.js/zip.js";
describe("validateEpubFile", () => {
  it("should throw an error if no file is provided", () => {
    expect(() => validateEpubFile(null as unknown as Blob)).toThrowError(
      ERROR_CODES.INVALID_EPUB_INPUT_NULL,
    );
  });

  it("should throw an error if the input is not a Blob", () => {
    expect(() =>
      validateEpubFile("not-a-blob" as unknown as Blob),
    ).toThrowError(ERROR_CODES.INVALID_EPUB_INPUT_TYPE);
  });

  it("should throw an error if the file is too small", () => {
    const smallFile = new Blob([""], { type: "application/epub+zip" });
    expect(() => validateEpubFile(smallFile)).toThrowError(
      ERROR_CODES.INVALID_SIZE_MIN,
    );
  });

  it("should throw an error if the file is too large", () => {
    const largeFile = new Blob([
      new ArrayBuffer(EPUB_DEFAULTS.maxFileSize + 1),
    ]);
    expect(() => validateEpubFile(largeFile)).toThrowError(
      ERROR_CODES.INVALID_SIZE_MAX,
    );
  });

  it("should not throw an error if the file is valid", () => {
    const validFile = new Blob(["valid content"], {
      type: "application/epub+zip",
    });
    expect(() => validateEpubFile(validFile)).not.toThrow();
  });
});

describe("validateEpubStructure", () => {
  const mockEntries = [
    { filename: "mimetype" },
    { filename: "META-INF/container.xml" },
  ];

  it("should throw an error if no entries are provided", () => {
    expect(() => validateEpubStructure([])).toThrowError(
      ERROR_CODES.NO_ENTRIES_FOUND,
    );
  });

  it("should throw an error if required entries are missing", () => {
    const config = { requiredEntries: ["mimetype", "miising-file"] };
    expect(() =>
      validateEpubStructure(mockEntries as Entry[], config),
    ).toThrowError(ERROR_CODES.MISSING_REQUIRED_ENTRIES);
  });

  it("should not throw an error if all required entries are present", () => {
    const config = { requiredEntries: ["mimetype", "META-INF/container.xml"] };
    expect(() =>
      validateEpubStructure(mockEntries as Entry[], config),
    ).not.toThrow();
  });
});
