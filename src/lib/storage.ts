import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const accountId = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = import.meta.env.VITE_CLOUDFLARE_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.VITE_CLOUDFLARE_SECRET_ACCESS_KEY;
const bucketName = import.meta.env.VITE_CLOUDFLARE_BUCKET_NAME;
const publicUrl = import.meta.env.VITE_CLOUDFLARE_PUBLIC_URL;

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
});

export const r2Storage = {
  uploadFile: async (file: File, path: string = "") => {
    try {
      if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
        throw new Error("Missing Cloudflare R2 credentials");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const fullPath = path ? `${path}/${fileName}` : fileName;

      const buffer = await file.arrayBuffer();
      
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fullPath,
        Body: new Uint8Array(buffer),
        ContentType: file.type,
      });

      await s3Client.send(command);

      const url = `${publicUrl}/${fullPath}`;
      return { url, path: fullPath, error: null };
    } catch (error: any) {
      console.error("Error uploading to R2:", error);
      return { url: null, path: null, error };
    }
  },

  deleteFile: async (path: string) => {
    try {
      if (!accountId || !bucketName) {
        throw new Error("Missing Cloudflare R2 credentials");
      }

      // Extract path from full URL if provided
      let key = path;
      if (path.startsWith(publicUrl || "")) {
        key = path.replace(`${publicUrl}/`, "");
      }

      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      await s3Client.send(command);
      return { error: null };
    } catch (error: any) {
      console.error("Error deleting from R2:", error);
      return { error };
    }
  }
};
