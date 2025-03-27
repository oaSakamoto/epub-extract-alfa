import { ResourcesMap } from "@/types/global";
import { createEpubProcessError, ERROR_CODES } from "./erros";

const CONTAINER_PATH = "META-INF/container.xml";
const EXPECTED_MEDIA_TYPE = "application/oebps-package+xml";

/**
 * Processes the EPUB container.xml file to extract the ফুলল-path of the root file.
 *
 * This function orchestrates the validation and parsing of the container.xml file,
 * ensuring it conforms to the EPUB specification and extracting the full path to the root file.
 * It calls a series of validation functions in sequence: `validateContainerPresence`,
 * `parseContainerXml`, `validateContainerStructure`, `validateRootFiles`, and `validateRootFileAttributes`.
 * Errors at any stage are caught and wrapped into an `EpubProcessError` with `UNEXPECTED_ERROR` code.
 *
 * @param {ResourcesMap} xmlMap - A map of resources within the EPUB, expected to contain container.xml.
 * @returns {Promise<string>} A promise that resolves to the full path of the root file, extracted from container.xml.
 * @throws {EpubProcessError} Throws an EpubProcessError if any validation or parsing step fails.
 *
 * @example
 * ```typescript
 * const rootFilePath = await processContainer(resourcesMap);
 * // rootFilePath is now the full path to the root file of the EPUB
 * ```
 */
export const processContainer = async (
  xmlMap: ResourcesMap,
): Promise<string> => {
  try {
    const containerBlob = validateContainerPresence(xmlMap);

    const containerDocument = await parseContainerXml(containerBlob);

    const rootFilesElement = validateContainerStructure(containerDocument);

    const rootFileElement = validateRootFilesElement(rootFilesElement);

    return validateRootFileAttributes(rootFileElement);
  } catch (error) {
    throw createEpubProcessError(
      `Unexpected error processing container: ${(error as Error).message || String(error)} `,
      ERROR_CODES.UNEXPECTED_ERROR,
    );
  }
};

/**
 * Validates the presence of the container.xml file in the resources map.
 *
 * Checks if the resources map contains an entry for 'META-INF/container.xml' and if the associated value is a Blob.
 *
 * @param {ResourcesMap} xmlMap - A map of resources within the EPUB, expected to contain container.xml.
 * @returns {Blob} The Blob representing the container.xml file.
 * @throws {EpubProcessError}
 * - NO_CONTAINER_FILE: if container.xml is not found in the resources map.
 * - INVALID_CONTAINER_FILE: if the container.xml entry in the map is not a Blob.
 *
 * @example
 * ```typescript
 * const containerBlob = validateContainerPresence(resourcesMap);
 * // containerBlob is the Blob for container.xml
 * ```
 */
export const validateContainerPresence = (xmlMap: ResourcesMap): Blob => {
  const containerBlob = xmlMap.get(CONTAINER_PATH);

  if (!containerBlob) {
    throw createEpubProcessError(
      `EPUB container missing required ${CONTAINER_PATH} `,
      ERROR_CODES.NO_CONTAINER_FILE,
    );
  }
  if (!(containerBlob instanceof Blob)) {
    throw createEpubProcessError(
      `Invalid container in ${CONTAINER_PATH} `,
      ERROR_CODES.INVALID_CONTAINER_FILE,
    );
  }
  return containerBlob;
};

/**
 * Parses the container.xml Blob into a XML Document.
 *
 * Uses DOMParser to parse the XML text content of the container Blob.
 *
 * @param {Blob} containerBlob - The Blob representing the container.xml file.
 * @returns {Document} The parsed XML Document of container.xml.
 * @throws {EpubProcessError}
 * - MALFORMED_XML: if the XML content of container.xml is malformed and cannot be parsed.
 *
 * @example
 * ```typescript
 * const containerDocument = await parseContainerXml(containerBlob);
 * // containerDocument is the parsed XML Document
 * ```
 */
export const parseContainerXml = async (
  containerBlob: Blob,
): Promise<Document> => {
  try {
    const xmlText = await containerBlob.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      xmlText,
      containerBlob.type as DOMParserSupportedType,
    );
    const parserErrorElement = doc.querySelector("parsererror");
    if (parserErrorElement) {
      throw createEpubProcessError(
        `Malformed XML in ${CONTAINER_PATH}: ${parserErrorElement.textContent?.slice(0, 100)} `,
        ERROR_CODES.MALFORMED_XML,
      );
    }
    return doc;
  } catch (error) {
    throw createEpubProcessError(
      `Error parsing XML in ${CONTAINER_PATH}: ${(error as Error).message || String(error)}`,
      ERROR_CODES.MALFORMED_XML, // Re-throw as MALFORMED_XML for parsing issues
    );
  }
};

/**
 * Validates the basic structure of the container.xml Document.
 *
 * Checks for the presence of the root `<container>` element and its child `<rootfiles>` element.
 *
 * @param {Document} containerDocument - The XML Document of container.xml.
 * @returns {Element} The `<rootfiles>` element from the container.xml document.
 * @throws {EpubProcessError}
 * - INVALID_CONTAINER_STRUCTURE: if the root element is not `<container>`.
 * - MISSING_ROOTFILES: if the `<container>` element does not contain a `<rootfiles>` child.
 *
 * @example
 * ```typescript
 * const rootFilesElement = validateContainerStructure(containerDocument);
 * // rootFilesElement is the <rootfiles> element
 * ```
 */
export const validateContainerStructure = (
  containerDocument: Document,
): Element => {
  const containerElement = containerDocument.documentElement;
  if (
    !containerElement ||
    containerElement.nodeName.toLowerCase() !== "container"
  ) {
    throw createEpubProcessError(
      `Missing root < container > element in ${CONTAINER_PATH} `,
      ERROR_CODES.INVALID_CONTAINER_STRUCTURE,
    );
  }

  const rootFilesElement = containerElement.querySelector("rootfiles");
  if (!rootFilesElement) {
    throw createEpubProcessError(
      `Missing required < rootfiles > element in ${CONTAINER_PATH} `,
      ERROR_CODES.MISSING_ROOTFILES,
    );
  }
  return rootFilesElement;
};

/**
 * Validates the `<rootfiles>` element in container.xml for EPUB requirements.
 *
 * Checks if the `<rootfiles>` element contains exactly one `<rootfile>` child element.
 *
 * @param {Element} rootFilesElement - The `<rootfiles>` element from the container.xml document.
 * @returns {Element} The `<rootfile>` element.
 * @throws {EpubProcessError}
 * - MISSING_ROOTFILE: if the `<rootfiles>` element contains no `<rootfile>` elements.
 * - MULTIPLE_ROOTFILES: if the `<rootfiles>` element contains more than one `<rootfile>` element.
 *
 * @example
 * ```typescript
 * const rootFileElement = validateRootFilesElement(rootFilesElement);
 * // rootFileElement is the <rootfile> element
 * ```
 */
export const validateRootFilesElement = (
  rootFilesElement: Element,
): Element => {
  const rootFilesElements = rootFilesElement.children;

  if (rootFilesElements.length === 0) {
    throw createEpubProcessError(
      `Missing required < rootfile > element in ${CONTAINER_PATH} `,
      ERROR_CODES.MISSING_ROOTFILE,
    );
  }

  if (rootFilesElements.length > 1) {
    throw createEpubProcessError(
      `Multiples rootfiles found(${rootFilesElements.length}) - only one supported`,
      ERROR_CODES.MULTIPLE_ROOTFILES,
    );
  }
  return rootFilesElements[0];
};

/**
 * Validates the attributes of the `<rootfile>` element for EPUB requirements.
 *
 * Checks for the presence and correctness of 'full-path' and 'media-type' attributes in the `<rootfile>` element.
 *
 * @param {Element} rootFileElement - The `<rootfile>` element from the container.xml document.
 * @returns {string} The value of the 'full-path' attribute of the validated `<rootfile>` element.
 * @throws {EpubProcessError}
 * - MISSING_FULL_PATH: if the `<rootfile>` element is missing the 'full-path' attribute.
 * - MISSING_MEDIA_TYPE: if the `<rootfile>` element is missing the 'media-type' attribute.
 * - INVALID_MEDIA_TYPE: if the 'media-type' attribute is not equal to 'application/oebps-package+xml'.
 *
 * @example
 * ```typescript
 * const rootFilePath = validateRootFileAttributes(rootFileElement);
 * // rootFilePath is the value of the full-path attribute
 * ```
 */
export const validateRootFileAttributes = (
  rootFileElement: Element,
): string => {
  const fullPath = rootFileElement.getAttribute("full-path");
  const mediaType = rootFileElement.getAttribute("media-type");

  if (!fullPath) {
    throw createEpubProcessError(
      "Rootfile missing required full-path attribute",
      ERROR_CODES.MISSING_FULL_PATH,
    );
  }
  if (!mediaType) {
    throw createEpubProcessError(
      "Rootfile missing required media-type attribute",
      ERROR_CODES.MISSING_MEDIA_TYPE,
    );
  }

  if (mediaType !== EXPECTED_MEDIA_TYPE) {
    throw createEpubProcessError(
      `Invalid rootfile media - type: ${mediaType || "undefined"} `,
      ERROR_CODES.INVALID_MEDIA_TYPE,
    );
  }
  return fullPath;
};
