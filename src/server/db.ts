import "server-only";
import fs from "node:fs";
import path from "node:path";
import { databaseSchema } from "@/domain/schemas";
import { seedDatabase } from "@/domain/seed";
import type { Database } from "@/domain/model";

const filePath = path.join(process.cwd(), "data", "store.json");

export function readDb(): Database {
  try {
    const parsed = databaseSchema.safeParse(JSON.parse(fs.readFileSync(filePath, "utf8")));
    if (parsed.success) return parsed.data;
  } catch {
    // The first request has no file yet. A corrupt file is replaced by the seed below.
  }
  const seeded = seedDatabase();
  writeDb(seeded);
  return seeded;
}

export function writeDb(db: Database) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
}

export function mintId(prefix: "ast" | "loc" | "shp" | "lon", existing: readonly string[]): string {
  let n = 1;
  let id = `${prefix}_${String(n).padStart(2, "0")}`;
  while (existing.includes(id)) {
    n += 1;
    id = `${prefix}_${String(n).padStart(2, "0")}`;
  }
  return id;
}
