import { absoluteUrl } from "../../lib/seo/site-url";

export default async function keepWarm() {
  await fetch(absoluteUrl("/api/admin/snapshot"), { headers: { "user-agent": "hussain-art-keep-warm" } });
}

export const config = { schedule: "*/2 * * * *" };
