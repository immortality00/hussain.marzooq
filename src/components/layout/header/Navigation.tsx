'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/photography', label: 'Photography' },
  { href: '/film', label: 'Film' },
  { href: '/webdev', label: 'Web Dev' },
  { href: '/nfts', label: 'NFTs' },
  { href: '/dance', label: 'Dance' },
  { href: '/contact', label: 'Contact' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex flex-wrap gap-6 justify-center">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`hover:text-gray-300 transition-colors ${
                  isActive ? 'text-blue-400 font-semibold' : ''
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
} 