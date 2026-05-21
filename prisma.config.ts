import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.local" });
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:StayDB2026!@serene-stay-db.c3me0aw0uxob.ap-south-1.rds.amazonaws.com:5432/devops_aws?sslmode=no-verify",
  },
});