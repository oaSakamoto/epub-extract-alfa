import { BlobReader, ZipReader } from "@zip.js/zip.js";
import { createEpubUnpackError, ERROR_CODES } from "./erros";

/**
 * Creates a ZipReader instance for reading an EPUB file.
 *
 * @param {Blob} epubBlob - The EPUB file as a Blob.
 * @returns {Promise<ZipReader<Blob>>} A promise that resolve to a ZipReader instance.
 * @throws {Error} Throws an error if the ZipReader creation fails.
 */
export const createZipReader = async (
  epubBlob: Blob,
): Promise<ZipReader<Blob>> => {
  try {
    const blobReader = new BlobReader(epubBlob);
    return new ZipReader(blobReader);
  } catch (error) {
    throw createEpubUnpackError(
      "Failed to create ZIP Reader",
      ERROR_CODES.ZIP_READER_CREATION_FAILED,
      error as Error,
    );
  }
};

/**
 * Safely closes a ZipReader instance.
 *
 * @param {ZipReader<Blob> | null} zipReader - The ZipReader instance to close.
 * @returns {Promise<void>} A promise that resolves when the ZipReader is closed.
 */
export const closeZipReaderSafely = async (
  zipReader: ZipReader<Blob> | null,
): Promise<void> => {
  if (!zipReader) return;
  try {
    await zipReader.close();
  } catch (error) {
    console.warn("Error closing ZIP Reader", error);
  }
};
