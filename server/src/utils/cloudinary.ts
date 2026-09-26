import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "clifford-alumni-demo",
  api_key: process.env.CLOUDINARY_API_KEY || "123456789012345",
  api_secret: process.env.CLOUDINARY_API_SECRET || "sample-secret",
});

export interface SignedUploadParams {
  folder: string;
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
}

export function generateUploadSignature(folder: string): SignedUploadParams {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";

  const paramsToSign = {
    folder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET || ""
  );

  return {
    folder,
    timestamp,
    signature,
    apiKey,
    cloudName,
  };
}

export async function deleteCloudinaryAsset(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (err) {
    console.error("Failed to delete Cloudinary asset:", err);
    return false;
  }
}

export { cloudinary };
