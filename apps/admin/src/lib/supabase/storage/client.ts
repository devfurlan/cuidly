import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';
import { createClient } from '../client';

const PUBLIC_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;

function getStorage() {
  const { storage } = createClient();
  return storage;
}

type UploadProps = {
  file: File;
  folder?: string;
  namePrefix?: string;
  nameCustom?: string;
  bucket?: string;
};

export const uploadPrivateFile = async ({
  file,
  folder,
  namePrefix = '',
  bucket = 'documents',
}: UploadProps) => {
  const fileName = file.name;
  const fileExtension = fileName.slice(fileName.lastIndexOf('.') + 1);
  const path = `${folder ? folder + '/' : ''}${namePrefix && `${namePrefix}_`}${uuidv4()}.${fileExtension}`;

  const storage = getStorage();

  const { data, error } = await storage.from(bucket).upload(path, file);

  if (error) {
    return { fileUrl: '', error: 'File upload failed' };
  }

  const fileUrl = `/${data?.path}`;

  return { fileUrl, error: '' };
};

export const uploadPublicImage = async ({
  file,
  folder,
  nameCustom,
}: UploadProps) => {
  if (!PUBLIC_BUCKET) {
    return { imageUrl: '', error: 'Storage bucket is not defined' };
  }

  const fileName = file.name;
  const fileExtension = fileName.slice(fileName.lastIndexOf('.') + 1);
  const path = `${folder ? folder + '/' : ''}${nameCustom ? nameCustom : uuidv4()}.${fileExtension}`;

  try {
    file = await imageCompression(file, {
      maxSizeMB: 1,
    });
  } catch (error) {
    console.error(error);
    return { imageUrl: '', error: 'Image compression failed' };
  }

  const storage = getStorage();

  const { data, error } = await storage.from(PUBLIC_BUCKET).upload(path, file);

  if (error) {
    return { imageUrl: '', error: 'Image upload failed' };
  }

  const imageUrl = `/${data?.path}`;

  return { imageUrl, error: '' };
};

export const uploadPublicFile = async ({
  file,
  folder,
  nameCustom,
}: UploadProps) => {
  if (!PUBLIC_BUCKET) {
    return { fileUrl: '', error: 'Storage bucket is not defined' };
  }

  const fileName = file.name;
  const fileExtension = fileName.slice(fileName.lastIndexOf('.') + 1);
  const path = `${folder ? folder + '/' : ''}${nameCustom ? nameCustom : uuidv4()}.${fileExtension}`;

  const storage = getStorage();

  const { data, error } = await storage.from(PUBLIC_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    return { fileUrl: '', error: 'File upload failed' };
  }

  const fileUrl = `/${data?.path}`;

  return { fileUrl, error: '' };
};

export const deleteFile = async (fileUrl: string, permission = 'public') => {
  const basePath =
    permission === 'public'
      ? '/storage/v1/object/public/'
      : '/storage/v1/object/sign/';

  const bucketAndPathString = fileUrl.split(basePath)[1];
  const firstSlashIndex = bucketAndPathString.indexOf('/');

  const bucket = bucketAndPathString.slice(0, firstSlashIndex);

  let path = bucketAndPathString.slice(firstSlashIndex + 1);
  if (permission !== 'public') {
    const queryIndex = path.indexOf('?');
    if (queryIndex !== -1) {
      path = path.slice(0, queryIndex);
    }
  }

  const storage = getStorage();

  const { data, error } = await storage.from(bucket).remove([path]);

  return { data, error };
};

export async function getPrivateFileUrl(path: string, bucket = 'documents') {
  const storage = getStorage();

  const { data, error } = await storage.from(bucket).createSignedUrl(path, 30);

  if (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }

  return data.signedUrl;
}
