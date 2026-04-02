"use client";

import { SerwistProvider as BaseSerwistProvider } from "@serwist/turbopack/react";

export default function SerwistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BaseSerwistProvider
      swUrl="/serwist/sw.js"
      disable={process.env.NODE_ENV === "development"}
      register={true}
      reloadOnOnline={true}
    >
      {children}
    </BaseSerwistProvider>
  );
}
