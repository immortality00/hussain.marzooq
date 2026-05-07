"use client";

export default function ContactMessageField({
  message,
  setMessage,
}: {
  message: string;
  setMessage: (value: string) => void;
}) {
  return (
    <div className="space-y-2 sm:col-span-2">
      <label className="text-sm font-medium">Message *</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="h-32 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        placeholder="Tell me about your project"
      />
    </div>
  );
}