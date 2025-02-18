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

export class EpubProcessError extends Error {
  constructor(
    message: string,
    private readonly errorCode: string,
    public readonly originalError?: Error,
  ) {
    super(`[${errorCode}] ${message}`);
    this.name = "EpubProcessError";
  }

  get code(): string {
    return this.errorCode;
  }
}

export const wrapEpubUnpackError = (error: unknown): never => {
  if (error instanceof EpubProcessError) {
    throw error;
  }

  throw new EpubProcessError(
    `Unexpected error during Epub unzip: ${error instanceof Error ? error.message : "Unknown error"}`,
    ERROR_CODES.UNEXPECTED_ERROR,
    error as Error,
  );
};
