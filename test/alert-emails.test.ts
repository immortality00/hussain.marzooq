import { describe, expect, test } from "vitest";
import { inquiryAlert, removalAlert, reviewAlert, signInRefusedAlert } from "@/lib/server/alert-emails";

const BASE = "https://hussain.art";

describe("admin alert emails", () => {
  test("use the visitor emails' layout and carry a plain-text version", () => {
    for (const email of [
      inquiryAlert({ id: "i1", name: "Sara", email: "sara@example.com", message: "Hi", serviceName: null, category: null }, BASE),
      reviewAlert({ id: "r1", name: "Lina", email: "lina@example.com", review: "Beautiful.", rating: 4, about: null }, BASE),
      removalAlert({ personName: "Omar", slug: "omar", email: "omar@example.com", reason: "Please hide." }, BASE),
      signInRefusedAlert({ device: "Windows · Chrome", reason: "rejected" }, BASE),
    ]) {
      expect(email.html).toContain("/brand/signature-white.png");
      expect(email.html).toContain("border:1px solid #ffffff;border-radius:999px");
      expect(email.html).toContain("Hussain.Art — Dubai based, available worldwide.");
      expect(email.text.length).toBeGreaterThan(20);
    }
  });

  test("an inquiry keeps its subject, shows the visitor and the message, and links to that inquiry in admin", () => {
    const email = inquiryAlert(
      { id: "66a1b2c3d4e5f60718293a4b", name: "Sara", email: "sara@example.com", message: "A wedding film.\nMarch, Dubai.", serviceName: "Wedding Film", category: "videography" },
      BASE
    );
    expect(email.subject).toBe("New inquiry from Sara");
    expect(email.html).toContain("Sara · sara@example.com");
    expect(email.html).toContain("Service: Wedding Film · Category: videography");
    expect(email.html).toContain("white-space:pre-line\">A wedding film.\nMarch, Dubai.</p>");
    expect(email.html).toContain('href="https://hussain.art/admin/inquiries?open=66a1b2c3d4e5f60718293a4b"');
    expect(email.text).toContain("A wedding film.\nMarch, Dubai.");
    expect(email.text).toContain("View in admin: https://hussain.art/admin/inquiries?open=66a1b2c3d4e5f60718293a4b");
  });

  test("what a visitor typed is escaped, never markup", () => {
    const email = inquiryAlert(
      { id: "i1", name: '<img src=x onerror="alert(1)">', email: "a@b.co", message: "<script>alert(1)</script>", serviceName: null, category: null },
      BASE
    );
    expect(email.html).not.toContain("<script>");
    expect(email.html).not.toContain("<img src=x");
    expect(email.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  test("a review shows its stars, a removal request links the profile, a refused sign-in says why", () => {
    const review = reviewAlert({ id: "66a1b2c3d4e5f60718293a4c", name: "Lina", email: "l@x.co", review: "Yes.", rating: 4, about: "Wedding" }, BASE);
    expect(review.html).toContain("★★★★☆");
    expect(review.html).toContain('href="https://hussain.art/admin/testimonials?review=66a1b2c3d4e5f60718293a4c"');
    expect(review.subject).toBe(
      "New testimonial from Lina — pending approval"
    );
    const removal = removalAlert({ personName: "", slug: "omar a", email: "o@x.co", reason: "Hide." }, BASE);
    expect(removal.subject).toBe("Removal request for omar a");
    expect(removal.html).toContain('href="https://hussain.art/people/omar%20a"');
    expect(signInRefusedAlert({ device: "Mac · Safari", reason: "wrong-number" }, BASE).text).toContain("The wrong number was picked.");
  });
});
