import "./globals.css";
import type { Metadata } from "next";
import { RootDocument } from "@/components/site/RootDocument";
import { PublicFrame } from "@/components/site/PublicFrame";
import { NotFoundContent } from "@/components/site/NotFoundContent";
import { ROOT_METADATA } from "@/lib/seo/root-metadata";

export const metadata: Metadata = {
  ...ROOT_METADATA,
  title: "Page not found — Hussain.Art",
};

export default function GlobalNotFound() {
  return (
    <RootDocument>
      <PublicFrame fullPageLoads>
        <NotFoundContent />
      </PublicFrame>
    </RootDocument>
  );
}
