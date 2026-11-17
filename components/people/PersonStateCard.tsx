import SmartImage from "@/components/shared/SmartImage";
import { DetailPage } from "@/components/shared/DetailPage";

// A person page that can't show the profile — locked behind its password, or "Content not
// available." — is one card under the Back button: the avatar, the name, then `children`.
export function PersonStateCard({
  name,
  avatarUrl,
  children,
}: {
  name: string;
  avatarUrl: string | null;
  children: React.ReactNode;
}) {
  return (
    <DetailPage backHref="/people" className="pb-16">
      <section className="mx-auto max-w-xl rounded-[2rem] border p-6 text-center">
        <div className="flex justify-center">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border bg-muted">
            {avatarUrl ? (
              <SmartImage src={avatarUrl} alt={name} fill className="object-cover" sizes="80px" />
            ) : null}
          </div>
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight wrap-anywhere">{name}</h1>
        {children}
      </section>
    </DetailPage>
  );
}
