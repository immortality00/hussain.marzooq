import { redirect } from "next/navigation";
import { StickyCta } from "@/components/site/StickyCta";
import { ContactFormClient } from "./ContactFormClient";
import clientPromise from "@/lib/mongodb";

async function submitInquiry(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !emailOk || !service || message.length < 10) {
    redirect("/contact?error=1");
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  await db.collection("inquiries").insertOne({
    name,
    email,
    service,
    location: location || null,
    message,
    status: "new",
    createdAt: new Date(),
  });

  redirect("/contact?success=1");
}

export default function ContactPage() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Book</h1>
        <p className="mt-3 text-muted-foreground">
          Tell me what you need. I’ll reply with availability and next steps.
        </p>

        <ContactFormClient />

        <form action={submitInquiry} className="mt-10 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                required
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@email.com"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="service">
                Service
              </label>
              <select
                id="service"
                name="service"
                required
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                defaultValue=""
              >
                <option value="" disabled>
                  Select…
                </option>
                <option value="Portrait Photography">Portrait Photography</option>
                <option value="Fashion Photography">Fashion Photography</option>
                <option value="Wedding Photography">Wedding Photography</option>
                <option value="Event Photography">Event Photography</option>
                <option value="Dance Film">Dance Film</option>
                <option value="Wedding Film">Wedding Film</option>
                <option value="Fashion Film">Fashion Film</option>
                <option value="Event Video">Event Video</option>
                <option value="Dance Teaching">Dance Teaching</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="location">
                Location (optional)
              </label>
              <input
                id="location"
                name="location"
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Dubai / Abu Dhabi / NYC…"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Describe what you need (date range, concept, references, budget range if you want)."
            />
            <p className="text-xs text-muted-foreground">
              Tip: Include a date range + reference links for faster booking.
            </p>
          </div>

          <button
            type="submit"
            className="rounded-full bg-foreground px-5 py-2 text-sm text-background hover:opacity-90 transition-opacity"
          >
            Send inquiry
          </button>
        </form>
      </main>

      <StickyCta />
    </>
  );
}
