import Script from "next/script";

export function SiteAnalytics() {
  const code = process.env.NEXT_PUBLIC_GOATCOUNTER_CODE?.trim();
  if (!code) return null;

  return (
    <Script
      async
      strategy="afterInteractive"
      data-goatcounter={`https://${code}.goatcounter.com/count`}
      src="https://gc.zgo.at/count.js"
    />
  );
}
