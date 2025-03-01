import { PrismaClient } from "@prisma/client";

// use globalThis.prisma to avoid creation of database connections on React App reloads
export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
  console.log("db connected");
}
