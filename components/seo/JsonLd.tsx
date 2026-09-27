import { jsonLdDocument, serializeJsonLd, type JsonLdNode } from "@/lib/seo/structured-data";

export function JsonLd({ nodes }: { nodes: (JsonLdNode | null)[] }) {
  const present = nodes.filter((node): node is JsonLdNode => node !== null);
  if (present.length === 0) return null;
  return <script type="application/ld+json">{serializeJsonLd(jsonLdDocument(present))}</script>;
}
