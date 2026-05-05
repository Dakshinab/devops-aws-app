import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { AWS_REGION, S3_BUCKET, s3Client } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    if (!s3Client || !S3_BUCKET || !AWS_REGION) {
      return NextResponse.json(
        { error: "S3 is not configured yet" },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    const fileUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
