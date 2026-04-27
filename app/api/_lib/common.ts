import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function asNullableString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

export function asNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function asFiniteNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function asBooleanOrNull(v: unknown): boolean | null {
  return typeof v === "boolean" ? v : null;
}

export function asStringArray(v: unknown, max = 60): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x : String(x)))
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);
}

export function normalizeSlug(v: string): string {
  return v.trim().toLowerCase();
}

export function isValidObjectIdString(s: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(s.trim());
}

export function parseObjectId(id: string): ObjectId | null {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

export function noStoreJson(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}