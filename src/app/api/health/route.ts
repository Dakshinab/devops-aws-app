import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  let dbStatus = "not tested";
  let dbError = "";

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (error) {
    dbStatus = "failed";
    dbError = error instanceof Error ? error.message : "unknown error";
  }

  return NextResponse.json({
    status: "ok",
    database: dbStatus,
    error: dbError,
    nodeEnv: process.env.NODE_ENV,
  });
}