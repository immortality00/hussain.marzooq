import { HINT_NAME } from "@/lib/auth/session-token";

export function hasAdminHint() {
  return document.cookie.split("; ").includes(`${HINT_NAME}=1`);
}
