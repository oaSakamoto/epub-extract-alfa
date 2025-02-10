/**
 * Error codes for EPUB unpacking operations.
 */
export const ERROR_CODES = {
  INVALID_ZIP_FORMAT: "INVALID_ZIP_FORMAT",
  NO_ENTRIES_FOUND: "NO_ENTRIES_FOUND",
  MISSING_REQUIRED_ENTRIES: "MISSING_REQUIRED_ENTRIES",
  UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
  ZIP_READER_CREATION_FAILED: "ZIP_READER_CREATION_FAILED",
  INVALID_EPUB_INPUT_NULL: "INVALID_EPUB_INPUT_NULL",
  INVALID_EPUB_INPUT_TYPE: "INVALID_EPUB_INPUT_TYPE",
  INVALID_SIZE_MIN: "INVALID_SIZE_MIN",
  INVALID_SIZE_MAX: "INVALID_SIZE_MAX",
  ZIP_READER_CLOSE_FAILED: "ZIP_READER_CLOSE_FAILED",
} as const;

/**
 * Represents an extended Error object with a custom `code` property
 */
interface EpubUnpackError extends Error {
  code: string;
  originalError?: Error;
}

/**
 * Creates a custom EPUB unpacking error.
 * @param {string} message - The error message.
 * @param {string} errorCode - The error code.
 * @param {Error} [originalError] - The original error that caused this error.
 * @returns {EpubUnpackError} - A custom error object with additional propertiers.
 */
export const createEpubUnpackError = (
  message: string,
  errorCode: string,
  originalError?: Error,
): EpubUnpackError => {
  const error = new Error(`[${errorCode}] ${message}`) as EpubUnpackError;
  error.name = "EpubUnpackError";
  error.code = errorCode;
  if (originalError) {
    error.originalError = originalError;
  }
  return error;
};

/**
 * Wraps an unknown error into an EpubUnpackError.
 * @param {unknown} error - The error to wrap.
 * @throws {EpubUnpackError} - Throws a custom EPUB unpacking error.
 */
export const wrapEpubUnpackError = (error: unknown): never => {
  if (error instanceof Error && error.name === "EpubUnpackError") {
    throw error;
  }

  throw createEpubUnpackError(
    `Unexpected error during EPUB unzip: ${error instanceof Error ? error.message : "Unknown error"}`,
    ERROR_CODES.UNEXPECTED_ERROR,
    error as Error,
  );
};
