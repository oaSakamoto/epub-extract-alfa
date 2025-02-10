import { Entry } from "@zip.js/zip.js";
import { EPUB_DEFAULTS } from "./config";
import { createEpubUnpackError, ERROR_CODES } from "./erros";
import { EpubConfig } from "@/types/global";

/**
 * Validate the EPUB file based on size and type.
 *
 * @param {Blob} file - The EPUB file to validate.
 * @param {Partial<EpubConfig>} config - Configuration options for validation.
 */
export const validateEpubFile = (
  file: Blob,
  config?: Partial<EpubConfig>,
): void => {
  const { maxFileSize, minFileSize } = { ...EPUB_DEFAULTS, ...config };

  if (!file) {
    throw createEpubUnpackError(
      "No EPUB file provided",
      ERROR_CODES.INVALID_EPUB_INPUT_NULL,
    );
  }

  if (!(file instanceof Blob)) {
    throw createEpubUnpackError(
      "Invalid input - must be a blob object",
      ERROR_CODES.INVALID_EPUB_INPUT_TYPE,
    );
  }

  if (file.size < minFileSize) {
    throw createEpubUnpackError("File is empty", ERROR_CODES.INVALID_SIZE_MIN);
  }

  if (file.size > maxFileSize) {
    throw createEpubUnpackError(
      `File too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`,
      ERROR_CODES.INVALID_SIZE_MAX,
    );
  }
};

/**
 * Validate the structure of the EPUB file by checking for required entries.
 *
 * @param {Entry[]} entries - The entries from the EPUB file.
 * @param {Partial<EpubConfig>} config - Configuration options for validation.
 * @throws {Error} - Throws an error if the structure is invalid.
 */
export const validateEpubStructure = (
  entries: Entry[],
  config: Partial<EpubConfig> = {},
): void => {
  const finalConfig: EpubConfig = { ...EPUB_DEFAULTS, ...config };

  if (!entries || entries.length === 0) {
    throw createEpubUnpackError(
      "No entries found in the EPUB file",
      ERROR_CODES.NO_ENTRIES_FOUND,
    );
  }
  const entryFilenames = entries.map((entry) => entry.filename);
  const missingEntries = finalConfig.requiredEntries?.filter(
    (required) => !entryFilenames.includes(required),
  );

  if (missingEntries && missingEntries?.length > 0) {
    throw createEpubUnpackError(
      `Missing required files ${missingEntries?.join(", ")}`,
      ERROR_CODES.MISSING_REQUIRED_ENTRIES,
    );
  }
};
