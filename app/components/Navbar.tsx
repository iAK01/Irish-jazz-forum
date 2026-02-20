"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
      <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
      <Link href="/" className="flex items-center gap-3">
  <img
    src="/images/IJF_Logo.png"
    alt="Irish Jazz Forum"
    className="h-10 w-auto"
  />
  <span className="text-xl font-semibold text-black dark:text-zinc-50">
    Irish Jazz Forum
  </span>
</Link>

        <div className="flex gap-5 text-sm font-medium items-center">
          <Link href="/about" className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white">About</Link>
          <Link href="/principles" className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white">Principles</Link>
          <Link href="/members" className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white">Members</Link>
          <Link href="/charter" className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white">Charter</Link>
          <Link href="/news" className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white">News</Link>
          <Link href="/dashboard/forum" className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white">Discuss</Link>
          <Link href="/contact" className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white">Contact</Link>

          {status === "loading" ? (
            <span className="text-zinc-500">...</span>
          ) : session ? (
            <>
              <Link href="/dashboard" className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white">Dashboard</Link>
              <span className="text-zinc-500">{session.user.name}</span>
              <button onClick={() => signOut()} className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white">Logout</button>
            </>
          ) : (
            <button onClick={() => signIn("google")} className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white">Login</button>
          )}
        </div>
      </div>
    </nav>
  );
}