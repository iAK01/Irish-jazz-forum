// /app/components/dashboard/DashboardLayout.tsx
// FIXED: Added "use client" directive

"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  userName: string;
  role?: string;
}

export default function DashboardLayout({
  children,
  title,
  userName,
  role,
}: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  const isAdmin = session?.user?.role === "admin" || session?.user?.role === "super_admin";

  return (
    <div className="min-h-screen bg-ijf-bg flex">
      {/* Sidebar Navigation */}
      {isAdmin && (
        <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-6">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-ijf-accent">Admin Panel</h2>
          </div>
          
          <nav className="space-y-2">
            <Link
              href="/dashboard/admin/members"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname?.startsWith('/dashboard/admin/members')
                  ? 'bg-ijf-accent text-white'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Members
            </Link>
            
            <Link
              href="/dashboard/admin/invitations"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname?.startsWith('/dashboard/admin/invitations')
                  ? 'bg-ijf-accent text-white'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Invitations
            </Link>
            
            <Link
              href="/dashboard/admin/forum"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname?.startsWith('/dashboard/admin/forum')
                  ? 'bg-ijf-accent text-white'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Forum
            </Link>
          </nav>
        </aside>
      )}
      
      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-ijf-accent mb-2">{title}</h1>
            <p className="text-ijf-muted">
              Welcome back, {userName} {role && `• Role: ${role}`}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}