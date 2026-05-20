import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    env: {
      hasDatabase: !!process.env.DATABASE_URL,
      hasRegion: !!process.env.APP_REGION,
      hasBucket: !!process.env.APP_S3_BUCKET,
      nodeEnv: process.env.NODE_ENV,
    },
  });
}