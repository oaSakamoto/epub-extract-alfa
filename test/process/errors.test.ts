/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import {
  wrapEpubUnpackError,
  createEpubProcessError,
  ERROR_CODES,
} from "../../src/process-resources/erros";

describe("Epub Error Handling", () => {
  describe("createEpubProcessError", () => {
    it("should create an EpubProcessError object with correct properties", () => {
      const message = "Test error message";
      const errorCode = ERROR_CODES.NO_CONTAINER_FILE;
      const originalError = new Error("Original cause");
      const error = createEpubProcessError(message, errorCode, originalError);

      expect(error.name).toBe("EpubProcessError");
      expect(error.message).toBe(`[${errorCode}] ${message}`);
      expect(error.code).toBe(errorCode);
      expect(error.originalError).toBe(originalError);
    });

    it("should create an EpubProcessError object without originalError", () => {
      const message = "Another test error message";
      const errorCode = ERROR_CODES.INVALID_CONTAINER_FILE;
      const error = createEpubProcessError(message, errorCode);

      expect(error.name).toBe("EpubProcessError");
      expect(error.message).toBe(`[${errorCode}] ${message}`);
      expect(error.code).toBe(errorCode);
      expect(error.originalError).toBeUndefined();
    });
  });

  describe("wrapEpubUnpackError", () => {
    it("should wrap and throw a new EpubProcessError for generic Error objects", () => {
      const genericError = new Error("Generic error");
      try {
        wrapEpubUnpackError(genericError);
      } catch (thrownError) {
        expect((thrownError as Error).name).toBe("EpubProcessError");
        expect((thrownError as any).code).toBe(ERROR_CODES.UNEXPECTED_ERROR);
        expect((thrownError as Error).message).toContain(
          "Unexpected error during Epub processing",
        );
        expect((thrownError as any).originalError).toBe(genericError);
      }
    });

    it("should wrap and throw a new EpubProcessError for non-Error objects (e.g., strings)", () => {
      const nonError = "Non-Error string";
      try {
        wrapEpubUnpackError(nonError);
      } catch (thrownError) {
        expect((thrownError as Error).name).toBe("EpubProcessError");
        expect((thrownError as any).code).toBe(ERROR_CODES.UNEXPECTED_ERROR);
        expect((thrownError as Error).message).toContain(
          "Unexpected error during Epub processing",
        );
        expect((thrownError as any).originalError).toBeInstanceOf(Error);
        expect((thrownError as any).originalError.message).toBe(
          String(nonError),
        );
      }
    });
  });
});
