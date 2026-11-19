
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

type SchoolHeaderProps = {
  children?: React.ReactNode;
  isLoading?: boolean;
  variant?: "sticky" | "inline";
};

const navigationItems = [
  { label: "Dashboard", href: "/school/dashboard" },
  { label: "Students", href: "/school/students" },
  { label: "Placements", href: "/school/placements" },
  { label: "Activity Monitoring", href: "/school/activity-monitoring" },
  { label: "Verification", href: "/school/verifications" },
];

export default function SchoolHeader({
  children,
  isLoading = false,
  variant = "sticky",
}: SchoolHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("siwesflow_token");
    setIsMenuOpen(false);
    setIsNavigationOpen(false);
    router.replace("/auth/login");
  };

  const closeNavigation = () => {
    setIsNavigationOpen(false);
  };

  return (
    <>
      <header
        className={
          variant === "sticky"
            ? "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8"
            : "mb-8 flex items-center justify-between gap-4"
        }
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setIsNavigationOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isNavigationOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#10195c] transition hover:bg-slate-100 lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="min-w-0">{children}</div>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          {isLoading && (
            <span className="hidden animate-pulse text-xs text-slate-400 sm:inline">
              Syncing...
            </span>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((previous) => !previous)}
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
              aria-label="Open coordinator menu"
              className="flex items-center gap-2 rounded-lg p-2 transition hover:bg-slate-50 sm:gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#10195c] text-xs font-semibold text-white">
                SC
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-[#10195c]">
                  School Coordinator
                </p>
                <p className="text-xs text-slate-500">
                  SIWES Coordinator
                </p>
              </div>

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`hidden h-4 w-4 text-slate-500 transition-transform sm:block ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-lg"
              >
                <div className="border-b border-slate-100 px-4 py-2">
                  <p className="text-sm font-semibold text-[#10195c]">
                    School Coordinator
                  </p>
                  <p className="text-xs text-slate-500">
                    SIWES Coordinator
                  </p>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M10 17l5-5-5-5" />
                    <path d="M15 12H3" />
                    <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      {isNavigationOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeNavigation}
            className="absolute inset-0 bg-black/50"
          />

          <aside className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col bg-[#07145c] text-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
              <Link
                href="/school/dashboard"
                onClick={closeNavigation}
                className="text-lg font-bold tracking-wide"
              >
                SIWESFlow
              </Link>

              <button
                type="button"
                onClick={closeNavigation}
                aria-label="Close navigation menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 p-4">
              {navigationItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeNavigation}
                    className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-[#1729c7] text-white"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-white/10 p-4">
              <p className="text-xs font-semibold text-white/55">
                SIWESFlow
              </p>
              <p className="mt-1 text-xs font-medium text-white/70">
                School Coordinator
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
