import { describe, expect, it, vi } from "vitest";
import * as utils from "../../src/unpack/utils";
import { BlobWriter, Entry, ZipReader } from "@zip.js/zip.js";
import { validateEpubStructure } from "../../src/unpack/validators.ts";
import { getMimeType } from "../../src/unpack/config.ts";

const { createEpubResourcesMap, retrieveAndValidateEntries } = utils;

vi.mock("../../src/unpack/config", () => ({
  getMimeType: vi.fn().mockResolvedValue("application/octet-stream"),
}));

vi.mock("../../src/unpack/validators", () => ({
  validateEpubStructure: vi.fn(),
}));

const mockEntry = (filename: string) =>
  ({
    filename,
    getData: vi
      .fn()
      .mockResolvedValue(
        new Blob(["test"], { type: "application/octet-stream" }),
      ) as unknown,
  }) as Entry;

describe("unpackUtils", () => {
  describe("extractBlobFromEntry", () => {
    it("should successfully extract a Blob from a ZIP entry", async () => {
      const entry = mockEntry("test.txt");
      const blob = await utils.extractBlobFromEntry(entry);
      expect(blob).toBeInstanceOf(Blob);
      expect(entry.getData).toHaveBeenCalledWith(expect.any(BlobWriter));
      expect(getMimeType).toHaveBeenCalledWith(entry);
    });
    it("should throw an error if Blob extraction fails", async () => {
      const entry = mockEntry("error.txt");
      const mockError = new Error("Extraction failed");
      entry.getData = vi.fn().mockRejectedValue(mockError);

      await expect(utils.extractBlobFromEntry(entry)).rejects.toThrowError(
        "Failed to extract blob from entry: error.txt. Extraction failed",
      );
    });
  });
  describe("retrieveAndValidateEntries", () => {
    it("should successfully retrieve and validate EPUB entries", async () => {
      const mockZipReader = {
        getEntries: vi
          .fn()
          .mockResolvedValue([
            mockEntry("entry1.txt"),
            mockEntry("entry2.txt"),
          ]),
      } as unknown as ZipReader<Blob>;

      const entries = await retrieveAndValidateEntries(mockZipReader);
      expect(entries).toHaveLength(2);
      expect(validateEpubStructure).toHaveBeenCalled();
      expect(mockZipReader.getEntries).toHaveBeenCalled();
    });
    it("should throw an error if EPUB strcture validation fails", async () => {
      const mockZipReader = {
        getEntries: vi.fn().mockResolvedValue([mockEntry("entry1.txt")]),
      } as unknown as ZipReader<Blob>;
      const mockValidationError = new Error("EPUB validation error");
      (
        validateEpubStructure as ReturnType<typeof vi.fn>
      ).mockImplementationOnce(() => {
        throw mockValidationError;
      });

      await expect(
        retrieveAndValidateEntries(mockZipReader),
      ).rejects.toThrowError(
        "EPUB structure validation failed: EPUB validation error",
      );
      expect(validateEpubStructure).toHaveBeenCalled();
      expect(mockZipReader.getEntries).toHaveBeenCalled();
    });
  });
  describe("createEpubResourceMap", () => {
    it("should successfully generate a resource map from EPUB ZIP file", async () => {
      const mockZipReader = {
        getEntries: vi
          .fn()
          .mockResolvedValue([
            mockEntry("entry1.txt"),
            mockEntry("entry2.txt"),
          ]),
      } as unknown as ZipReader<Blob>;

      const resourcesMap = await createEpubResourcesMap(mockZipReader);
      expect(resourcesMap).toBeInstanceOf(Map);
      expect(resourcesMap.size).toBe(2);
      expect(resourcesMap.has("entry1.txt")).toBe(true);
      expect(resourcesMap.has("entry2.txt")).toBe(true);
      expect(validateEpubStructure).toHaveBeenCalled();
      expect(mockZipReader.getEntries).toHaveBeenCalled();
    });
  });
});
