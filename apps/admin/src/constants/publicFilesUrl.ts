const getBaseUrl = (): { baseUrl: string; bucket: string } => {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;

  if (!baseUrl || !bucket) {
    throw new Error(
      'Environment variables NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET are not defined',
    );
  }

  return { baseUrl, bucket };
};

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

  // If pathPhoto is already a full URL, we need to convert it to use the render endpoint
  // This handles legacy data that might have full URLs stored
  if (pathPhoto.startsWith('http://') || pathPhoto.startsWith('https://')) {
    // Remove any existing query parameters before processing
    const urlWithoutQuery = pathPhoto.split('?')[0];
    // Extract the path from the full URL
    const match = urlWithoutQuery.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
    if (match) {
      const { baseUrl, bucket } = getBaseUrl();
      return `${baseUrl}/storage/v1/render/image/public/${bucket}/${match[1]}?width=${width}&height=${height}&resize=cover&quality=${quality}`;
    }
    // If we can't parse it, return the original URL without query params
    return urlWithoutQuery;
  }

  const { baseUrl, bucket } = getBaseUrl();
  return `${baseUrl}/storage/v1/render/image/public/${bucket}${pathPhoto}?width=${width}&height=${height}&resize=cover&quality=${quality}`;
};
