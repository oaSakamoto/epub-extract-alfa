export const ERROR_CODES = {
  NO_CONTAINER_FILE: "NO_CONTAINER_FILE",
  INVALID_CONTAINER_FILE: "INVALID_CONTAINER_FILE",
  MALFORMED_XML: "MALFORMED_XML",
  INVALID_CONTAINER_STRUCTURE: "INVALID_CONTAINER_STRUCTURE",
  MISSING_ROOTFILES: "MISSING_ROOTFILES",
  MISSING_ROOTFILE: "MISSING_ROOTFILE",
  MULTIPLE_ROOTFILES: "MULTIPLE_ROOTFILES",
  MISSING_FULL_PATH: "MISSING_FULL_PATH",
  MISSING_MEDIA_TYPE: "MISSING_MEDIA_TYPE",
  INVALID_MEDIA_TYPE: "INVALID_MEDIA_TYPE",
  UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
} as const;

/**
 * Creates an EpubProcessError object.
 *
 * This factory function generates an error object specifically for EPUB processing errors.
 * It includes a strctured error with a name, a code, and a optional original error for debugging context.
 *
 * @param {string} message - The error message describing the error.
 * @param {string} errorCode - A predefined error code from ERROR_CODES enum.
 * @param {Error} [originalError] - The original error object, if any, that cause this error.
 * @returns {{ name: string, message: string, code: string, originalError: Error | undefined }} An error object with EpubProcessError structure.
 *
 * @example
 * ```typescript
 * throw createEpubProcessError("Container file not found", ERROR_CODES.NO_CONTAINER_FILE);
 * ```
 */
export const createEpubProcessError = (
  message: string,
  errorCode: string,
  originalError?: Error,
): {
  name: string;
  message: string;
  code: string;
  originalError: Error | undefined;
} => {
  return {
    name: "EpubProcessError",
    message: `[${errorCode}] ${message}`,
    code: errorCode,
    originalError,
  };
};

/**
 * Wraps an error into an EpubProcessError if it's not already one.
 *
 * This function checks if the given error is already an EpubProcessError. If it is, it re-throws it.
 * Otherwise, it wraps the error into a new EpubProcessError with a generic "UNEXPECTED_ERROR" code
 * and throws the new error, providing a consistent error handling mechanism for EPUB unpacking processes.
 *
 * @param {unknown} error - The error object to wrap. It can be any type, but is expected to be an Error or an object representing an error condition.
 * @returns {never} This function always throws an error. It either re-throws the original EpubProcessError or throws a new wrapped EpubProcessError.
 * @throws {EpubProcessError} Always throws an EpubProcessError. If the input error is already an EpubProcessError, it's re-thrown; otherwise, a new EpubProcessError with UNEXPECTED_ERROR code is thrown.
 *
 * @example
 * ```typescript
 * try {
 *   // Some operation that might throw an error
 *   throw new Error("Unexpected file format");
 * } catch (error) {
 *   wrapEpubUnpackError(error); // Will throw EpubProcessError
 * }
 * ```
 */
export const wrapEpubUnpackError = (error: unknown): never => {
  // Using structural check instead of 'instanceof' for functional approach
  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as Error).name === "EpubProcessError"
  ) {
    throw error;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  throw createEpubProcessError(
    `Unexpected error during Epub processing: ${errorMessage}`,
    ERROR_CODES.UNEXPECTED_ERROR,
    error instanceof Error ? error : new Error(errorMessage), // Create a new Error object if 'error' is not already one for consistency
  );
};
