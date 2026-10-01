import fs from "node:fs";
import path from "node:path";

export function sourceFiles(dir: string, pattern: RegExp): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full, pattern);
    return pattern.test(entry.name) ? [full] : [];
  });
}

export const readSource = (file: string) => fs.readFileSync(file, "utf8");
export const relativePath = (file: string) => path.relative(process.cwd(), file);
export const fromRoot = (...parts: string[]) => path.join(process.cwd(), ...parts);
