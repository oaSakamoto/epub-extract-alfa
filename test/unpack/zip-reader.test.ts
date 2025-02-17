import { describe, it, expect, vi } from "vitest";
import {
  closeZipReaderSafely,
  createZipReader,
} from "../../src/unpack/zip-reader";
import { BlobReader, ZipReader } from "@zip.js/zip.js";
import { beforeEach } from "node:test";
import {
  createEpubUnpackError,
  EpubUnpackError,
  ERROR_CODES,
} from "../../src/unpack/erros";
//import { createEpubUnpackError, ERROR_CODES } from "../../src/unpack/erros";

vi.mock("@zip.js/zip.js");
vi.mock("../../src/unpack/erros.ts", () => ({
  ERROR_CODES: {
    ZIP_READER_CREATION_FAILED: "ZIP_READER_CREATION_FAILED",
  },
  createEpubUnpackError: vi.fn(),
}));

const mockBlob = new Blob(["dummy content"], { type: "application/epub+zip" });

describe("createZipReader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully creates a ZipReader instance", async () => {
    const mockZipReaderInstance = {} as ZipReader<Blob>;
    vi.mocked(ZipReader).mockImplementation(() => mockZipReaderInstance);

    const result = await createZipReader(mockBlob);

    expect(BlobReader).toHaveBeenCalledWith(mockBlob);
    expect(ZipReader).toHaveBeenCalledWith(expect.any(BlobReader));
    expect(result).toBe(mockZipReaderInstance);
  });

  it("should throws an error when creation fails", async () => {
    const mockError = new Error("Constructor error");

    vi.mocked(ZipReader).mockImplementation(() => {
      throw mockError;
    });

    const mockedError = new Error("Mocked error") as EpubUnpackError;
    vi.mocked(createEpubUnpackError).mockReturnValue(mockedError);

    await expect(createZipReader(mockBlob)).rejects.toThrow(mockedError);

    expect(createEpubUnpackError).toHaveBeenCalledWith(
      "Failed to create ZIP Reader",
      ERROR_CODES.ZIP_READER_CREATION_FAILED,
      mockError,
    );
  });
});

describe("closeZipReaderSafely", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it("should does nothing when zipReader is null", async () => {
    await expect(closeZipReaderSafely(null)).resolves.not.toThrow();
  });

  it("should closes the zipReader when valid", async () => {
    const mockZipReader = {
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as ZipReader<Blob>;

    await closeZipReaderSafely(mockZipReader);

    expect(mockZipReader.close).toHaveBeenCalled();
  });

  it("should errors during close and logs a warning", async () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      // eslint-disable-next-line prettier/prettier
      .mockImplementation(() => { });

    const mockError = new Error("Close error");
    const mockZipReader = {
      close: vi.fn().mockRejectedValue(mockError),
    } as unknown as ZipReader<Blob>;

    await closeZipReaderSafely(mockZipReader);

    expect(mockZipReader.close).toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Error closing ZIP Reader",
      mockError,
    );
  });
});
