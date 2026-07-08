export const CLOUDINARY_ROOT_FOLDER = "hm_visuals";

export const CLOUDINARY_MEDIA_FOLDER = `${CLOUDINARY_ROOT_FOLDER}/media`;
export const CLOUDINARY_PEOPLE_FOLDER = `${CLOUDINARY_ROOT_FOLDER}/people`;
export const CLOUDINARY_SERVICES_FOLDER = `${CLOUDINARY_ROOT_FOLDER}/services`;
export const CLOUDINARY_TESTIMONIALS_FOLDER = `${CLOUDINARY_ROOT_FOLDER}/testimonials`;
// Images uploaded directly into page sections + the Work overlay ("work layout")
// cards, kept in their own folder so they can be signed and cleaned up on replace.
export const CLOUDINARY_SECTIONS_FOLDER = `${CLOUDINARY_ROOT_FOLDER}/sections`;

export const CLOUDINARY_MEDIA_CATEGORY_FOLDER_MAP = {
  photography: `${CLOUDINARY_MEDIA_FOLDER}/photography`,
  videography: `${CLOUDINARY_MEDIA_FOLDER}/videography`,
  showreel: `${CLOUDINARY_MEDIA_FOLDER}/showreel`,
  nft: `${CLOUDINARY_MEDIA_FOLDER}/nfts`,
  art: `${CLOUDINARY_MEDIA_FOLDER}/art`,
} as const;

export type CloudinaryMediaCategory = keyof typeof CLOUDINARY_MEDIA_CATEGORY_FOLDER_MAP;

export const CLOUDINARY_MEDIA_CATEGORY_FOLDERS = Object.values(
  CLOUDINARY_MEDIA_CATEGORY_FOLDER_MAP
);

export const CLOUDINARY_MANAGED_FOLDERS = [
  CLOUDINARY_MEDIA_FOLDER,
  CLOUDINARY_PEOPLE_FOLDER,
  CLOUDINARY_SERVICES_FOLDER,
  CLOUDINARY_TESTIMONIALS_FOLDER,
  CLOUDINARY_SECTIONS_FOLDER,
] as const;

export function isCloudinaryMediaCategory(value: string): value is CloudinaryMediaCategory {
  return Object.hasOwn(CLOUDINARY_MEDIA_CATEGORY_FOLDER_MAP, value);
}

export function getCloudinaryMediaFolderForCategory(category: string | null | undefined) {
  if (!category || !isCloudinaryMediaCategory(category)) return CLOUDINARY_MEDIA_FOLDER;
  return CLOUDINARY_MEDIA_CATEGORY_FOLDER_MAP[category];
}

export function getCloudinaryMediaFoldersForCategories(categories: readonly string[]) {
  const folders = categories
    .filter(isCloudinaryMediaCategory)
    .map((category) => CLOUDINARY_MEDIA_CATEGORY_FOLDER_MAP[category]);

  return folders.length > 0 ? folders : [CLOUDINARY_MEDIA_FOLDER];
}