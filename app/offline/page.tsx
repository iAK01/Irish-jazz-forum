"use client";

export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "#9b1d1d", opacity: 0.8 }}
      >
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "var(--color-ijf-bg)",
        }}
      >
        You&apos;re offline
      </h1>
      <p style={{ color: "#6b7280", maxWidth: "22rem", lineHeight: 1.6 }}>
        This page isn&apos;t available without a connection. Pages you&apos;ve
        already visited will still work — head back and browse from there.
      </p>
      <button
        onClick={() => history.back()}
        style={{
          marginTop: "0.5rem",
          padding: "0.6rem 1.5rem",
          borderRadius: "0.5rem",
          backgroundColor: "var(--color-ijf-primary)",
          color: "white",
          fontWeight: 600,
          fontSize: "0.9rem",
          border: "none",
          cursor: "pointer",
        }}
      >
        Go back
      </button>
    </main>
  );
}
