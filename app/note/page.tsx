"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import NotesEditor from "@/components/NotesEditor";
import AuthButton from "@/components/AuthButton";

export default function NotePage() {
  const { data: session } = useSession();
  const canEdit = !!(session?.user as any)?.canEdit;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* TOP NAV */}
      <div style={{
        height: 56, flexShrink: 0,
        background: "rgba(8,11,16,0.95)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center",
        padding: "0 28px", gap: 16,
        position: "relative", zIndex: 10,
      }}>
        {/* logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 8, textDecoration: "none" }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg,#60a5fa,#a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "white", fontFamily: "'Space Mono',monospace",
          }}>T</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Space Mono',monospace", color: "#f1f5f9", letterSpacing: "0.04em" }}>TAIDE</div>
            <div style={{ fontSize: 9, color: "#334155", fontFamily: "'Space Mono',monospace", letterSpacing: "0.08em", marginTop: -1 }}>MULTIMODAL</div>
          </div>
        </Link>

        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)" }}></div>

        {/* right */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 20, alignItems: "center" }}>
          <AuthButton session={session} />
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, overflow: "hidden", padding: "28px 32px", display: "flex", flexDirection: "column" }}>
        <NotesEditor canEdit={canEdit} />
      </div>
    </div>
  );
}
