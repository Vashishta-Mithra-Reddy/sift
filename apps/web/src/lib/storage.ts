import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: false,
});


export const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";
// If you have a custom domain mapped to your R2 bucket, use it here.
// Otherwise, we might default to the worker URL or similar if configured.
// For now, we will try to use a standard public URL pattern or placeholder.
const r2Url = process.env.NEXT_PUBLIC_R2_URL || "";
export const R2_PUBLIC_URL = r2Url 
  ? (r2Url.startsWith("http") ? r2Url : `https://${r2Url}`) 
  : ""; 
