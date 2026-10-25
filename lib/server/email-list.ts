import { getContactSections } from "@/lib/server/page-sections";
import { shownEmails, type EmailListItem } from "@/lib/email-list";

// Read by the footer of every public page, so it must never throw. A failed read
// shows no email column rather than an address that was hidden in admin.
export async function getFooterEmails(): Promise<EmailListItem[]> {
  try {
    return shownEmails((await getContactSections()).emails);
  } catch (error) {
    console.error("[email-list] read failed", error);
    return [];
  }
}
