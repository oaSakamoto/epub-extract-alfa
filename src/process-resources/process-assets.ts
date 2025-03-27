import { ResourcesMap } from "@/types/global";

export const processAssets = async (
  cssAssets: ResourcesMap,
  imagesAssets: ResourcesMap,
) => {
  const cssProcessed = new Map<string, string>();
  const imagesProcessed = new Map<string, string>();
  cssAssets.forEach(async (blob, key) => {
    const dataUrl = URL.createObjectURL(blob);
    if (dataUrl !== null && dataUrl !== undefined) {
      cssProcessed.set(key, dataUrl);
    }
  });
  imagesAssets.forEach(async (blob, key) => {
    const dataUrl = URL.createObjectURL(blob);
    if (dataUrl !== null && dataUrl !== undefined) {
      imagesProcessed.set(key, dataUrl);
    }
  });

  return { cssProcessed, imagesProcessed };
};
