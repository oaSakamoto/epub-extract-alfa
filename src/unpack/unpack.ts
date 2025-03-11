import { EpubConfig, ResourcesMap } from "@/types/global";
import { wrapEpubUnpackError } from "./erros";
import { validateEpubFile } from "./validators";
import { createZipReader, closeZipReaderSafely } from "./zip-reader";
import { createEpubResourcesMap } from "./utils";

/**
 * Unpacks an EPUB file from a Blob, validators it, and generates a resources map.
 *
 * This function orchestrates the process of unpacking an EPUB file. It creates a ZipReader,
 * validates the EPUB file structure, generates a map of resources (filename to Blob),
 * and ensures the ZipReader is properly closed afterwards. Erros during the process are
 * wrapped using `wrapEpubUnpackError` for consistent error handling.
 *
 * @param {Blob} epub - The EPUB file as a Blob.
 * @param {Partial<EpubConfig>} [config={}] - Optional configuration for EPUB unpacking and validation.
 * @returns {Promise<ResourcesMap>} A promise that resolves to a ResourceMap, mapping filenames to their Blob data within the EPUB.
 * @throws {Error} Throws an error if EPUB validation or resources map generation fails.
 *
 * @example
 * ```typescript
 * const resourcesMap = await unpackEpub(epubBlob);
 * // resourcesMap is now a Map of filenames to Blobs from the EPUB
 * ```
 */
export const unpackEpub = async (
  epub: Blob,
  config: Partial<EpubConfig> = {},
): Promise<ResourcesMap> => {
  let zipReader;

  try {
    zipReader = await createZipReader(epub);
    validateEpubFile(epub, config);
    return await createEpubResourcesMap(zipReader);
  } catch (error) {
    wrapEpubUnpackError(error);
    throw error;
  } finally {
    if (zipReader) {
      await closeZipReaderSafely(zipReader);
    }
  }
};
