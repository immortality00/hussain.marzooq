import { Briefcase, Images, LayoutDashboard, Lock, Users, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string };
export type NavGroup = { label: string; icon: LucideIcon; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    items: [
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/analytics", label: "Analytics" },
    ],
  },
  {
    label: "Content",
    icon: Images,
    items: [
      { href: "/admin/media/list", label: "Media" },
      { href: "/admin/tags", label: "Tags" },
      { href: "/admin/blog", label: "Blog" },
      { href: "/admin/blog-categories", label: "Blog Categories" },
      { href: "/admin/pages", label: "Pages" },
    ],
  },
  {
    label: "People",
    icon: Users,
    items: [
      { href: "/admin/people", label: "People" },
      { href: "/admin/removal-requests", label: "Removal Requests" },
      { href: "/admin/testimonials", label: "Testimonials" },
      { href: "/admin/inquiries", label: "Inquiries" },
    ],
  },
  {
    label: "Services",
    icon: Briefcase,
    items: [
      { href: "/admin/services", label: "Services" },
      { href: "/admin/service-categories", label: "Service Categories" },
    ],
  },
  {
    label: "Private",
    icon: Lock,
    items: [{ href: "/admin/private-galleries", label: "Private Galleries" }],
  },
];
