"use client";

export default function ContactIdentityFields({
  name,
  setName,
  email,
  setEmail,
}: {
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Your name"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Email *</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="you@email.com"
          inputMode="email"
        />
      </div>
    </>
  );
}