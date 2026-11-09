"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/school/dashboard",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
      >
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    label: "Students",
    href: "/school/students",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Placements",
    href: "/school/placements",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
      >
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 12h18" />
      </svg>
    ),
  },
  {
    label: "Activity Monitoring",
    href: "/school/activity-monitoring",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
      >
        <path d="M3 12h4l2-7 4 14 2-7h6" />
      </svg>
    ),
  },
];

export default function SchoolNavigation() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col bg-[#07145c] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-56">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <Link
          href="/school/dashboard"
          className="flex items-center"
          aria-label="SIWESFlow school dashboard"
        >
          <Image
            src="/siwesflow_logo.png"
            alt="SIWESFlow"
            width={130}
            height={40}
            className="h-auto w-[130px] object-contain"
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-[#1729c7] text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-4">
        <p className="text-xs text-white/45">SIWESFlow</p>
        <p className="mt-1 text-xs text-white/65">School Coordinator</p>
      </div>
    </aside>
  );
}