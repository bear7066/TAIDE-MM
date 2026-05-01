"use client";

import { useEffect } from "react";

export const fieldStyle = {
  width: "100%",
  padding: "8px 10px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#f1f5f9",
  fontSize: 12,
  fontFamily: "'Space Mono',monospace",
  outline: "none",
} as const;

export const labelStyle = {
  display: "block",
  fontSize: 10,
  color: "#475569",
  fontFamily: "'Space Mono',monospace",
  letterSpacing: "0.08em",
  marginBottom: 6,
  textTransform: "uppercase" as const,
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 560,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: width, maxHeight: "90vh",
          background: "#0e1117",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14,
          display: "flex", flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* header */}
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", color: "#475569",
              cursor: "pointer", fontSize: 18, lineHeight: 1,
            }}
          >×</button>
        </div>

        {/* body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {children}
        </div>

        {/* footer */}
        {footer && (
          <div style={{
            padding: "14px 24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex", justifyContent: "flex-end", gap: 8,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export const Button = ({
  variant = "primary",
  children,
  ...props
}: { variant?: "primary" | "ghost" | "danger" } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const styles = {
    primary: { background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.35)", color: "#60a5fa" },
    ghost:   { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" },
    danger:  { background: "rgba(244,114,182,0.10)", border: "1px solid rgba(244,114,182,0.3)", color: "#f472b6" },
  }[variant];
  return (
    <button
      {...props}
      style={{
        padding: "7px 16px", borderRadius: 8,
        fontSize: 11, fontFamily: "'Space Mono',monospace",
        cursor: "pointer", transition: "all 0.18s",
        ...styles,
        ...props.style,
      }}
    >{children}</button>
  );
};
