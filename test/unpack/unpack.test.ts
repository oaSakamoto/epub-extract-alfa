import { describe, expect, it, vi } from "vitest";
import { unpackEpub } from "../../src/unpack/unpack.ts";
import {
  closeZipReaderSafely,
  createZipReader,
} from "../../src/unpack/zip-reader.ts";
import { createEpubResourcesMap } from "../../src/unpack/utils.ts";
import { validateEpubFile } from "../../src/unpack/validators.ts";
import { wrapEpubUnpackError } from "../../src/unpack/erros.ts";

vi.mock("../../src/unpack/zip-reader", () => ({
  createZipReader: vi.fn(),
  closeZipReaderSafely: vi.fn(),
}));

vi.mock("../../src/unpack/validators.ts", () => ({
  validateEpubFile: vi.fn(),
}));

vi.mock("../../src/unpack/utils.ts", () => ({
  createEpubResourcesMap: vi.fn(),
}));

vi.mock("../../src/unpack/erros.ts", () => ({
  wrapEpubUnpackError: vi.fn(),
}));

describe("unpackEpub", () => {
  it("should successfully unpack EPUB and return resources map", async () => {
    const mockZipReader = {};
    const mockResourcesMap = new Map([["file1.txt", new Blob(["content1"])]]);
    const mockEpubBlob = new Blob(["epub content"], {
      type: "application/epub+zip",
    });

    (createZipReader as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockZipReader,
    );
    (createEpubResourcesMap as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResourcesMap,
    );
    const resourceMap = await unpackEpub(mockEpubBlob);
    expect(createZipReader).toHaveBeenCalledWith(mockEpubBlob);
    expect(validateEpubFile).toHaveBeenCalledWith(mockEpubBlob, {});
    expect(closeZipReaderSafely).toHaveBeenCalledWith(mockZipReader);
    expect(resourceMap).toBe(mockResourcesMap);
  });
  it("should handle EPUB validation error and wrap error", async () => {
    const mockZipReader = {};
    const mockEpubBlob = new Blob(["invalid epub content"], {
      type: "application/epub+zip",
    });
    const validationError = new Error("EPUB validation failed");

    (createZipReader as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockZipReader,
    );
    (validateEpubFile as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => {
        throw validationError;
      },
    );

    await expect(unpackEpub(mockEpubBlob)).rejects.toThrowError(
      validationError,
    );
    expect(createZipReader).toHaveBeenCalledWith(mockEpubBlob);
    expect(validateEpubFile).toHaveBeenCalledWith(mockEpubBlob, {});
    expect(wrapEpubUnpackError).toHaveBeenCalledWith(validationError);
    expect(closeZipReaderSafely).toHaveBeenCalledWith(mockZipReader); // Ensure cleanup even on error
  });
  it("should handle resource map creation error and wrap error", async () => {
    const mockZipReader = {};
    const mockEpubBlob = new Blob(["epub content"], {
      type: "application/epub+zip",
    });
    const resourceMapError = new Error("Resource map creation failed");

    (createZipReader as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockZipReader,
    );
    (createEpubResourcesMap as ReturnType<typeof vi.fn>).mockRejectedValue(
      resourceMapError,
    );

    await expect(unpackEpub(mockEpubBlob)).rejects.toThrowError(
      resourceMapError,
    );
    expect(createZipReader).toHaveBeenCalledWith(mockEpubBlob);
    expect(validateEpubFile).toHaveBeenCalledWith(mockEpubBlob, {});
    expect(wrapEpubUnpackError).toHaveBeenCalledWith(resourceMapError);
    expect(closeZipReaderSafely).toHaveBeenCalledWith(mockZipReader); // Ensure cleanup even on error
  });
});
