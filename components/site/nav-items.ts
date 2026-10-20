import { DISCIPLINES, type DisciplineSlug } from "@/lib/disciplines";

export type NavItem = { href: string; label: string };

const PAGE_ITEMS: NavItem[] = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/people", label: "People" },
  { href: "/testimonials", label: "Testimonials" },
];

export function navItems(activeDisciplines: readonly DisciplineSlug[]): NavItem[] {
  const active = new Set(activeDisciplines);
  return [
    ...DISCIPLINES.filter((d) => active.has(d.slug)).map((d) => ({ href: d.href, label: d.navLabel })),
    ...PAGE_ITEMS,
  ];
}

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
