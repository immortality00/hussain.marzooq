export function PrivacySection({ heading, body }: { heading: string; body: string[] }) {
  return (
    <section className="border-t border-border pt-8">
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{heading}</h2>
      <div className="mt-8 max-w-2xl space-y-4">
        {body.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-7 text-muted-foreground">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
