"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  userName: string;
  role?: string;
}

export default function DashboardLayout({ children, title, userName, role }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close sidebar when navigating
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const isAdmin = session?.user?.role === "admin" || session?.user?.role === "super_admin";
  const isTeam = session?.user?.role === "team";

  const navItems = [
    {
      href: "/dashboard/admin/users",
      label: "Users",
      match: "/dashboard/admin/users",
      roles: ["super_admin"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      href: "/dashboard/admin/members",
      label: "Members",
      match: "/dashboard/admin/members",
      roles: ["admin", "super_admin"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      href: "/dashboard/admin/invitations",
      label: "Invitations",
      match: "/dashboard/admin/invitations",
      roles: ["admin", "super_admin"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      href: "/dashboard/admin/publications",
      label: "Publications",
      match: "/dashboard/admin/publications",
      roles: ["admin", "super_admin", "team"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2zM13 4v6h6M9 13h6M9 17h4" />
        </svg>
      ),
    },
    {
      href: "/dashboard/forum",
      label: "Forum",
      match: "/dashboard/forum",
      roles: ["admin", "super_admin", "team"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      href: "/dashboard/admin/contact",
      label: "Submissions",
      match: "/dashboard/admin/contact",
      roles: ["admin", "super_admin"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  const userRole = session?.user?.role || "";
  const visibleNav = navItems.filter((item) => item.roles.includes(userRole));
  const showSidebar = isAdmin || isTeam;

  const NavLinks = () => (
    <nav className="space-y-1">
      {visibleNav.map((item) => {
        const isActive = pathname?.startsWith(item.match);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              isActive
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-ijf-bg flex">

      {/* Desktop sidebar — only when not mobile */}
      {showSidebar && !isMobile && (
        <aside
          className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-6 flex-shrink-0"
        >
          <div className="mb-8">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Admin Panel</h2>
          </div>
          <NavLinks />
        </aside>
      )}

      {/* Mobile overlay backdrop */}
      {showSidebar && isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        />
      )}

      {/* Mobile sidebar drawer */}
      {showSidebar && isMobile && (
        <aside
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100%",
            width: "16rem",
            zIndex: 50,
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.3s ease-in-out",
            backgroundColor: "white",
            borderRight: "1px solid #e4e4e7",
            padding: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
            <h2 className="text-lg font-bold text-zinc-900">Admin Panel</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <NavLinks />
        </aside>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">

        {/* Mobile top bar */}
        {showSidebar && isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              backgroundColor: "white",
              borderBottom: "1px solid #e4e4e7",
            }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-zinc-900">Admin Panel</span>
          </div>
        )}

        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            padding: isMobile ? "1.5rem 1rem" : "3rem 2rem",
          }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-ijf-accent mb-2">{title}</h1>
            <p className="text-ijf-muted">
              Welcome back, {userName}
              {role && ` • Role: ${role}`}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}