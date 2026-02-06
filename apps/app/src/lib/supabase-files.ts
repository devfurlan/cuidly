/**
 * Helper functions for working with Supabase Storage files
 */

const getBaseUrl = (): { baseUrl: string; bucket: string } => {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'files';

  if (!baseUrl) {
    throw new Error(
      'Environment variable NEXT_PUBLIC_SUPABASE_URL is not defined',
    );
  }

  return { baseUrl, bucket };
};

/**
 * Convert a relative file path to a full public URL
 * @param pathFile - Relative path like "/partner/slug/avatar.jpg"
 * @returns Full public URL
 */
export const publicFilesUrl = (pathFile: string): string => {
  // Handle null/undefined
  if (!pathFile) {
    return '';
  }

  // If pathFile is already a full URL, return it as is
  if (pathFile.startsWith('http://') || pathFile.startsWith('https://')) {
    return pathFile;
  }

  const { baseUrl, bucket } = getBaseUrl();
  return `${baseUrl}/storage/v1/object/public/${bucket}${pathFile}`;
};

/**
 * Convert a relative photo path to a transformed/resized public URL using Supabase Image Transformation
 * @param pathPhoto - Relative path like "/partner/slug/avatar.jpg" or full URL
 * @param width - Target width in pixels
 * @param height - Target height in pixels
 * @param quality - Image quality (1-100)
 * @returns Full public URL with transformation parameters
 */
export const publicPhotoUrl = (
  pathPhoto: string,
  width: number = 150,
  height: number = 150,
  quality: number = 80,
): string => {
  // Handle null/undefined
  if (!pathPhoto) {
    return '';
  }

  // If pathPhoto is already a full URL, return it directly
  // Image transformation via /render/ endpoint may not be available on all Supabase plans
  if (pathPhoto.startsWith('http://') || pathPhoto.startsWith('https://')) {
    // Remove any existing query parameters and return the clean URL
    return pathPhoto.split('?')[0];
  }

  const { baseUrl, bucket } = getBaseUrl();
  return `${baseUrl}/storage/v1/render/image/public/${bucket}${pathPhoto}?width=${width}&height=${height}&resize=cover&quality=${quality}`;
};
