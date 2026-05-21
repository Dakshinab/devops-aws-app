import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.local" });
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});