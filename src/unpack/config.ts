import { Entry } from "@zip.js/zip.js";

const BYTES_PER_MB = 1024 * 1024;
const MAX_FILE_SIZE_MB = 50;
/**
 * Configuration constants for Epub file validation.
 */
export const EPUB_DEFAULTS = {
  /** Maximum allowed file size in bytes (50MB). */
  maxFileSize: MAX_FILE_SIZE_MB * BYTES_PER_MB,
  /** Minimum allowed file size in bytes (1 byte). */
  minFileSize: 1,
  /** Required file entries for a valid EPUB structure. */
  requiredEntries: ["mimetype", "META-INF/container.xml"] as const,
} as const;

const MIME_TYPE_EXTENSIONS = {
  mimetype: "mimetype",
  txt: "text/plain",
  html: "text/html",
  htm: "text/html",
  css: "text/css",
  png: "image/png",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  xml: "application/xml",
  xhtml: "application/xhtml+xml",
  opf: "application/oebps-package+xml",
  ncx: "application/x-dtbncx+xml",
} as const;

/**
 * MIME type mapping for common file extension.
 */
export const MIME_TYPES_MAP = new Map(Object.entries(MIME_TYPE_EXTENSIONS));
/**
 * Extracts the lowercase file extension from a filename.
 * @param filename - Full name of the file.
 * @returns Lowercase file extension or undefined if none exists.
 */
export const getFileExtension = (filename: string): string | undefined => {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : undefined;
};

/**
 * Determines the MIME type of  a ZIP entry.
 * - Directories are indetified by trailing slashes.
 * - Uses file extension mapping, defaults to octet-stream.
 * @param entry - ZIP library entry objectc.
 * @returns Detected MIME type string
 */
export function getMimeType(entry: Entry): string {
  if (entry.filename.endsWith("/")) return "directory";

  const extension = getFileExtension(entry.filename);
  return extension
    ? (MIME_TYPES_MAP.get(extension) ?? "application/octet-stream")
    : "application/octet-stream";
}
