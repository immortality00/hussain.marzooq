import { heightCapForWidth } from "@/lib/cloudinary-limits";
import {
  IMAGE_DEVICE_SIZES,
  IMAGE_SIZES,
  TEXTURE_WIDTH,
  TEXTURE_WIDTH_SMALL,
  TRANSITION_IMAGE_WIDTH,
} from "@/lib/image-sizes";

export const VIDEO_FRAME_TRANSFORM = "so_0";

export const STRICT_IMAGE_FORMATS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
  "heic",
  "heif",
  "tiff",
  "bmp",
  "svg",
];

export function imageTransform(width: number): string {
  return `w_${width},h_${heightCapForWidth(width)},c_limit,q_auto,f_auto`;
}

export function textureTransform(width: number): string {
  return `w_${width},c_limit,q_auto,f_auto`;
}

export function deliveredTransforms(): string[] {
  const imageWidths = [...IMAGE_DEVICE_SIZES, ...IMAGE_SIZES, TRANSITION_IMAGE_WIDTH];
  return [
    ...imageWidths.map(imageTransform),
    ...[TEXTURE_WIDTH, TEXTURE_WIDTH_SMALL].map(textureTransform),
  ];
}

export function strictAllowList(): string[] {
  return [
    ...deliveredTransforms().flatMap((transform) => [
      transform,
      ...STRICT_IMAGE_FORMATS.map((format) => `${transform}/${format}`),
    ]),
    VIDEO_FRAME_TRANSFORM,
    `${VIDEO_FRAME_TRANSFORM}/jpg`,
  ];
}
