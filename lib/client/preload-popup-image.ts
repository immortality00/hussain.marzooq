import { getImageProps } from "next/image";
import { preload } from "react-dom";

/** The `sizes` of a media popup's picture; the popup and the early download share it. */
export const POPUP_IMAGE_SIZES = "(min-width: 1024px) 62vw, 100vw";
export const NFT_POPUP_IMAGE_SIZES = "(min-width: 1024px) 58vw, 100vw";

/**
 * Starts downloading the picture a popup will show the moment a card is pressed,
 * instead of after the tap opens it. Same `src`, `srcSet` and `sizes` as the
 * popup's next/image, so the browser picks the same file and the popup finds it
 * already arriving.
 */
export function preloadPopupImage(src: string | null | undefined, sizes = POPUP_IMAGE_SIZES) {
  if (!src) return;
  const { props } = getImageProps({ src, alt: "", fill: true, sizes });
  if (!props.src) return;
  preload(props.src, { as: "image", imageSrcSet: props.srcSet, imageSizes: sizes, fetchPriority: "high" });
}
