"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/principles", label: "Principles" },
    { href: "/members", label: "Members" },
    { href: "/charter", label: "Charter" },
    { href: "/news", label: "News" },
    { href: "/dashboard/forum", label: "Discuss" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black relative z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <img src="/images/IJF_Logo.png" alt="Irish Jazz Forum" className="h-10 w-auto" />
          {!isMobile && (
            <span className="text-xl font-semibold text-black dark:text-zinc-50">Irish Jazz Forum</span>
          )}
        </Link>

        {/* Desktop nav links */}
        {!isMobile && (
          <div className="flex gap-5 text-sm font-medium items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {status === "loading" ? (
              <span className="text-zinc-500">...</span>
            ) : session ? (
              <>
                <Link href="/dashboard" className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors">
                  Dashboard
                </Link>
                <span className="text-zinc-500">{session.user.name}</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/signin" })}
                  className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/signin" className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors">
                Login
              </Link>
            )}
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold text-black dark:text-zinc-50">Irish Jazz Forum</span>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "white",
            borderBottom: "1px solid #e4e4e7",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            zIndex: 50,
          }}
        >
          <div className="px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-black transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div style={{ borderTop: "1px solid #e4e4e7", marginTop: "0.5rem", paddingTop: "0.5rem" }}>
              {status === "loading" ? (
                <span className="text-zinc-500 text-sm px-3">...</span>
              ) : session ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block py-2.5 px-3 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <div className="py-2.5 px-3 text-sm text-zinc-500">{session.user.name}</div>
                  <button
                    onClick={() => { signOut({ callbackUrl: "/signin" }); setMenuOpen(false); }}
                    className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}