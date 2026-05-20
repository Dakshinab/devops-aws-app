import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.APP_REGION;
const accessKeyId = process.env.APP_ACCESS_KEY_ID;
const secretAccessKey = process.env.APP_SECRET_ACCESS_KEY;

export const AWS_REGION = region ?? "";
export const S3_BUCKET = process.env.APP_S3_BUCKET ?? "";

export const s3Client =
  region && accessKeyId && secretAccessKey
    ? new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      })
    : null;