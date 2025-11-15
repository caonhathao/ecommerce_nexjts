import { v2 as cloudinary } from 'cloudinary';
import type {
  UploadApiOptions,
  UploadApiResponse,
  ResourceType,
  DeliveryType,
} from 'cloudinary';
import { Readable } from 'stream';
import { env } from './env';

cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: env.CLOUDINARY_API_KEY!,
  api_secret: env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export async function uploadToCloudinary(
  buffer: Buffer | string,
  options?: Partial<UploadApiOptions>
): Promise<UploadApiResponse> {
  const opts = {
    folder: options?.folder ?? 'product-images',
    resource_type: 'auto' as const,
    use_filename: true,
    unique_filename: false,
    ...options,
  } as UploadApiOptions;

  if (typeof buffer === 'string') {
    // string (URL / path / data URI) -> use upload
    return cloudinary.uploader.upload(buffer, opts);
  }

  // Buffer -> stream to uploader.upload_stream
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      opts,
      (err: any, result: UploadApiResponse | undefined) => {
        if (err) return reject(err);
        if (!result) return reject(new Error('Empty upload result'));
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function deleteFromCloudinary(
  publicId: string,
  options?: Partial<{
    resource_type?: ResourceType;
    type?: DeliveryType;
    invalidate?: boolean;
  }>
) {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true,
    ...options,
  });
  return result;
}
