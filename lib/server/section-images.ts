import { CLOUDINARY_SECTIONS_FOLDER } from "@/lib/cloudinary-folders";
import { collectSectionImagePublicIds } from "@/lib/page-sections-shared";
import { deleteManagedCloudinaryAsset } from "@/lib/server/cloudinary-assets";

// Deletes uploaded section images whose publicId was present in the old content
// but is gone from the new content — i.e. replaced or removed on save. Scoped to
// the sections Cloudinary folder, so only section-uploaded assets can be
// deleted; library-picked images carry an empty publicId and are never touched.
export async function deleteReplacedSectionImages(
  oldData: unknown,
  newData: unknown,
): Promise<void> {
  const oldIds = collectSectionImagePublicIds(oldData);
  if (oldIds.length === 0) return;

  const newIds = new Set(collectSectionImagePublicIds(newData));
  const orphaned = oldIds.filter((id) => !newIds.has(id));
  if (orphaned.length === 0) return;

  await Promise.all(
    orphaned.map((publicId) =>
      deleteManagedCloudinaryAsset({ publicId }, [CLOUDINARY_SECTIONS_FOLDER]),
    ),
  );
}
