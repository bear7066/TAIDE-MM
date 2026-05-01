"use client";

import { signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function AuthButton({ session }: { session: any }) {
  const [open, setOpen] = useState(false);
  const user = session?.user;

  if (!user) {
    return (
      <button
        onClick={() => signIn("github")}
        style={{
          padding: "5px 12px", borderRadius: 8,
          fontSize: 11, fontFamily: "'Space Mono',monospace",
          background: "rgba(96,165,250,0.10)",
          border: "1px solid rgba(96,165,250,0.25)",
          color: "#60a5fa", cursor: "pointer",
        }}
      >
        Sign in with GitHub
      </button>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "4px 10px 4px 4px", borderRadius: 20,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          cursor: "pointer",
        }}
      >
        {user.image && (
          <img src={user.image} alt="" width={22} height={22} style={{ borderRadius: "50%" }} />
        )}
        <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'Space Mono',monospace" }}>
          {user.githubLogin || user.name}
          {user.canEdit && <span style={{ color: "#34d399", marginLeft: 6 }}>✓</span>}
        </span>
      </button>
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          style={{
            position: "absolute", top: "100%", right: 0, marginTop: 6,
            background: "#161c2a", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: 6, minWidth: 160, zIndex: 100,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ padding: "6px 10px", fontSize: 10, color: "#475569", fontFamily: "'Space Mono',monospace" }}>
            {user.canEdit ? "Editor permission" : "Read-only"}
          </div>
          <button
            onClick={() => signOut()}
            style={{
              width: "100%", textAlign: "left",
              padding: "6px 10px", borderRadius: 6,
              background: "none", border: "none",
              color: "#f472b6", cursor: "pointer",
              fontSize: 11, fontFamily: "'Space Mono',monospace",
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
