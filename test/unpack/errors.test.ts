import { describe, expect, it } from "vitest";
import {
  createEpubUnpackError,
  ERROR_CODES,
  wrapEpubUnpackError,
} from "../../src/unpack/erros.ts";
describe("createEpubUnpackError", () => {
  it("should create an EpubUnpackError with the correct properties", () => {
    const message = "Test error message";
    const errorCode = ERROR_CODES.INVALID_ZIP_FORMAT;
    const originalError = new Error("Original error");

    const error = createEpubUnpackError(message, errorCode, originalError);

    expect(error.message).toBe(`[${errorCode}] ${message}`);
    expect(error.name).toBe("EpubUnpackError");
    expect(error.code).toBe(errorCode);
    expect(error.originalError).toBe(originalError);
  });

  it("should create an EpubUnpackError without an original error", () => {
    const message = "Test error message";
    const errorCode = ERROR_CODES.INVALID_ZIP_FORMAT;

    const error = createEpubUnpackError(message, errorCode);

    expect(error.message).toBe(`[${errorCode}] ${message}`);
    expect(error.name).toBe("EpubUnpackError");
    expect(error.code).toBe(errorCode);
  });
});

describe("wrapEpubUnpackError", () => {
  it("should throw the same error if it is already an EpubUnpackError", () => {
    const originalError = new Error("Original error");
    originalError.name = "EpubUnpackError";

    expect(() => wrapEpubUnpackError(originalError)).toThrow(originalError);
  });

  it("should wrap a generic error into an EpubUnpackError", () => {
    const genericError = new Error("Generic error");

    expect(() => wrapEpubUnpackError(genericError)).toThrowError(
      /\[UNEXPECTED_ERROR\] Unexpected error during EPUB unzip: Generic error/,
    );
  });

  it("should wrap a non-Error object into an EpubUnpackError", () => {
    const nonError = "This is not an Error object";

    expect(() => wrapEpubUnpackError(nonError)).toThrowError(
      /\[UNEXPECTED_ERROR\] Unexpected error during EPUB unzip: Unknown error/,
    );
  });
});
