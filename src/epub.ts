/* v8 ignore start */
import processResources from "./process-resources";
import { ResourcesMap } from "./types/global";
import unpackEpub from "./unpack";

export class Epub {
  public resources!: ResourcesMap;
  public epubInfo!: object;
  public spine!: string[];
  public content!: string[];
  public coverImage!: string;

  public async create(blob: Blob) {
    this.resources = await unpackEpub(blob);
    const { epubInfo, htmlProcessed, spine, coverImage } =
      await processResources(this.resources);
    this.epubInfo = epubInfo;
    this.spine = spine;
    this.content = htmlProcessed;
    this.coverImage = coverImage as string;
  }
}
