export type GeoPoint = {
  key: string;
  label: string;
  count: number;
  lat: number;
  lon: number;
};

function getMapEmbedUrl(point: GeoPoint) {
  const { lat, lon } = point;
  const delta = 0.85;
  const marker = `&marker=${lat.toFixed(6)},${lon.toFixed(6)}`;
  const bbox = [lon - delta, lat - delta, lon + delta, lat + delta]
    .map((value) => value.toFixed(6))
    .join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${marker}`;
}

export function TestimonialMap({ activePoint }: { activePoint: GeoPoint | null }) {
  if (!activePoint) {
    return (
      <section className="overflow-hidden rounded-[1.25rem] border border-border/60 bg-muted/20 p-2 shadow-sm">
        <div className="flex h-[250px] items-center justify-center rounded-[1rem] border border-border/70 bg-background px-6 text-center text-sm text-muted-foreground sm:h-[290px]">
          No location
        </div>
      </section>
    );
  }

  const mapUrl = getMapEmbedUrl(activePoint);

  return (
    <section className="overflow-hidden rounded-[1.25rem] border border-border/60 bg-muted/20 p-2 shadow-sm">
      <div className="relative overflow-hidden rounded-[1rem] border border-border/70 bg-background">
        <iframe
          key={activePoint.key}
          title={`Map centered on ${activePoint.label}`}
          src={mapUrl}
          className="h-[250px] w-full translate-y-[-8px] scale-[1.05] border-0 grayscale-[0.08] sm:h-[290px]"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background via-background/95 to-transparent" />

        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium shadow-sm ring-1 ring-border/60 backdrop-blur">
          {activePoint.label}
        </div>

        <div className="pointer-events-none absolute bottom-2 right-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] text-muted-foreground shadow-sm ring-1 ring-border/60 backdrop-blur">
          © OpenStreetMap
        </div>
      </div>
    </section>
  );
}
