import { PublicFrame } from "@/components/site/PublicFrame";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <PublicFrame>{children}</PublicFrame>;
}
