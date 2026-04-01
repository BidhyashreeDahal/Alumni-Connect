import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

if (env.CLOUDINARY_ENABLED) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

function toNotFound(error) {
  return error?.http_code === 404 || error?.error?.http_code === 404;
}

export function isCloudinaryEnabled() {
  return env.CLOUDINARY_ENABLED;
}

export async function uploadImageBuffer({ publicId, buffer, format = "webp" }) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: "image",
        overwrite: true,
        invalidate: true,
        format
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );

    stream.end(buffer);
  });
}

export async function uploadRawBuffer({ publicId, buffer }) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: "raw",
        overwrite: true,
        invalidate: true
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );

    stream.end(buffer);
  });
}

export async function cloudinaryResourceExists({ publicId, resourceType }) {
  try {
    await cloudinary.api.resource(publicId, { resource_type: resourceType });
    return true;
  } catch (error) {
    if (toNotFound(error)) return false;
    throw error;
  }
}

export function buildCloudinaryDeliveryUrl({ publicId, resourceType, format, signUrl = false }) {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    type: "upload",
    secure: true,
    sign_url: signUrl,
    format
  });
}
