import { defineConfig } from "drizzle-kit";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Drizzle-kit runs outside Next.js so it doesn't pick up .env.local on its
 * own. Load it manually here before defineConfig reads process.env.
 */
function loadDotenvFile(path: string) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    if (process.env[key]) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadDotenvFile(resolve(process.cwd(), ".env.local"));
loadDotenvFile(resolve(process.cwd(), ".env"));

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: false,
});
