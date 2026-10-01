import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  DASHBOARD_COPY_CACHE,
  DASHBOARD_PATH,
  DATA_CHANGED_MESSAGE,
  SAVE_COPY_HEADER,
} from "@/lib/client/admin-dashboard-copy";

function files(dir: string, pattern: RegExp): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return files(full, pattern);
    return pattern.test(entry.name) ? [full] : [];
  });
}

const read = (file: string) => fs.readFileSync(file, "utf8");
const relative = (file: string) => path.relative(process.cwd(), file);

describe("admin navigation", () => {
  it("builds every signed-in admin screen ahead of time and reads its data on the phone", () => {
    const pages = files(path.join(process.cwd(), "app/admin/(protected)"), /^page\.tsx$/);
    expect(pages.length).toBeGreaterThan(15);
    const problems = pages.flatMap((file) => {
      const source = read(file);
      const found: string[] = [];
      if (!/<AdminScreen[\s>]/.test(source)) found.push("no AdminScreen");
      if (/force-dynamic|revalidate\s*=|getDb|cookies\(|headers\(/.test(source)) found.push("renders on the server");
      if (/^import (?!type)[^;]*from "@\/lib\/server\//m.test(source)) found.push("imports server code");
      return found.map((problem) => `${relative(file)}: ${problem}`);
    });
    expect(problems).toEqual([]);
    expect(read("app/admin/(protected)/layout.tsx")).not.toMatch(/force-dynamic|isAdminAuthedServer|getDb/);
  });

  it("links through AdminLink only", () => {
    const sources = [
      ...files(path.join(process.cwd(), "app/admin"), /\.(ts|tsx)$/),
      ...files(path.join(process.cwd(), "components/admin"), /\.(ts|tsx)$/),
    ];
    const direct = sources
      .filter((file) => !file.endsWith(path.join("components", "admin", "AdminLink.tsx")))
      .filter((file) => /from "next\/link"/.test(read(file)))
      .map(relative);
    expect(direct).toEqual([]);
  });

  it("shares the dashboard copy and change-signal names with the service worker", () => {
    const worker = read("public/admin-sw.js");
    expect(worker).toContain(`const DASHBOARD_PATH = "${DASHBOARD_PATH}";`);
    expect(worker).toContain(`const PAGE_CACHE = "${DASHBOARD_COPY_CACHE}";`);
    expect(worker).toContain(`const SAVE_COPY_HEADER = "${SAVE_COPY_HEADER}";`);
    expect(worker).toContain(`const DATA_CHANGED_MESSAGE = "${DATA_CHANGED_MESSAGE}";`);
  });

  it("never fetches from the network while the worker hands out the saved dashboard", () => {
    const worker = read("public/admin-sw.js");
    const dashboard = worker.slice(worker.indexOf("async function dashboard("), worker.indexOf("async function launchScreenOrNetwork("));
    expect(dashboard).toContain("if (cached) return cached;");
    expect(dashboard).not.toMatch(/waitUntil\(fetchDashboard/);
  });
});
