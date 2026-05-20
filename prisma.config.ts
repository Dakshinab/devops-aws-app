import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:StayDB2026!@serene-stay-db.c3me0aw0uxob.ap-south-1.rds.amazonaws.com:5432/devops_aws",
  },
});