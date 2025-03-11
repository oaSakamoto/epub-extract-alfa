import { BlobWriter, Entry, ZipReader } from "@zip.js/zip.js";
import { validateEpubStructure } from "./validators";
import { getMimeType } from "./config";
import { EpubConfig, ResourcesMap } from "@/types/global";

/**
 * Extracts the Blob data from a given ZIP entry.
 *
 * @param {Entry} entry - The ZIP entry to extract the Blob from.
 * @returns {Promise<Blob>} A promise that resolves to the Blob of the entry's data.
 * @throws Throws an error if extraction fails.
 * @example
 * ```typescript
 * const blob = await extractBlobFromEntry
 * ```
 */
export const extractBlobFromEntry = async (entry: Entry): Promise<Blob> => {
  try {
    const mimeType = getMimeType(entry);
    return await entry.getData!(new BlobWriter(mimeType));
  } catch (error) {
    throw new Error(
      `Failed to extract blob from entry: ${entry.filename}. ${(error as Error).message}`,
    );
  }
};

/**
 * Retrieves entries from an EPUB ZIP file and validates its structure.
 *
 * @param {ZipReader<Blob>}  zipReader - The ZipReader instance to reading entries.
 * @param {Partial<EpubConfig>} [config={}] - Option configuration for EPUB validation.
 * @returns {Promise<Entry[]>} A promise that resolves to an array of validate ZIP entries.
 * @throws {Error} Throws an error if EPUB structure validation fails.
 *
 * @example
 * ```typescript
 * const entries = await retrieveAndValidateEntries(zipReader);
 * ```
 */
export const retrieveAndValidateEntries = async (
  zipReader: ZipReader<Blob>,
  config: Partial<EpubConfig> = {},
): Promise<Entry[]> => {
  try {
    const entries = await zipReader.getEntries();
    validateEpubStructure(entries, config);

    return await Promise.all(entries);
  } catch (error) {
    throw new Error(
      `EPUB structure validation failed: ${(error as Error).message}`,
    );
  }
};

/**
 * Generates a resource map for an EPUB ZIP file, mapping filenames to their Blob data.
 *
 * This function retrieves entries, validates the EPUB structure, and then extracts Blob data for each entry,
 * creation a map where keys are filenames and values are their corresponding Blobs.
 *
 * @param {ZipReader<Blob>} zipReader - The ZipReader instance to read entries from.
 * @param {Partial<EpubConfig>} [config={}] - Optional configuration for EPUB validation.
 * @returns {Promise<ResourcesMap>} A promise that resolves to a ResourcesMap (filename to Blob mapping).
 */
export const createEpubResourcesMap = async (
  zipReader: ZipReader<Blob>,
  config: Partial<EpubConfig> = {},
  helperExtractBlobFromEntry = extractBlobFromEntry,
): Promise<ResourcesMap> => {
  try {
    const entries = await retrieveAndValidateEntries(zipReader, config);
    const blobs_t: Promise<Blob>[] = entries.map(helperExtractBlobFromEntry);
    const blobs: Blob[] = await Promise.all(blobs_t);

    const resourcesMap = new Map<string, Blob>([]);

    entries.forEach((entry: Entry, index: number) => {
      resourcesMap.set(entry.filename, blobs[index]);
    });
    return resourcesMap;
  } catch (error) {
    throw new Error(
      `Failed to generate EPUB resource map: ${(error as Error).message}`,
    );
  }
};
