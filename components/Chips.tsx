"use client";

import { MODALITY_META, STATUS_META, SOURCE_COLORS } from "@/lib/tokens";

export const Chip = ({ label, color, bg, border, icon }: any) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "2px 8px", borderRadius: 6,
    fontSize: 10, fontFamily: "'Space Mono',monospace", letterSpacing: "0.06em",
    color, background: bg, border: `1px solid ${border}`,
    whiteSpace: "nowrap",
  }}>
    {icon && <span style={{ fontSize: 9 }}>{icon}</span>}{label}
  </span>
);

export const ModalityChip = ({ m }: { m: string }) => {
  const meta = MODALITY_META[m] || MODALITY_META.video;
  return <Chip {...meta} label={meta.label} />;
};

export const StatusChip = ({ s }: { s: string }) => {
  const meta = STATUS_META[s] || STATUS_META["計劃中"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 8px", borderRadius: 6,
      fontSize: 10, fontFamily: "'Space Mono',monospace",
      color: meta.color, background: meta.bg, border: `1px solid ${meta.border}`,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: "50%", background: meta.dot,
        boxShadow: meta.pulse ? `0 0 6px ${meta.dot}` : "none",
      }}></span>
      {s}
    </span>
  );
};

export const SourceChip = ({ src }: { src: string }) => {
  const meta = SOURCE_COLORS[src] || SOURCE_COLORS["—"];
  return <Chip color={meta.color} bg={meta.bg} border={meta.border} label={src} />;
};

export const Tag = ({ label }: { label: string }) => (
  <span style={{
    padding: "2px 6px", borderRadius: 4, fontSize: 9,
    fontFamily: "'Space Mono',monospace", letterSpacing: "0.06em",
    color: "#475569", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
  }}>{label}</span>
);

export const Metric = ({ val, label }: { val: any; label: string }) => (
  <div style={{
    flex: 1, minWidth: 70,
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 8, padding: "8px 10px",
    display: "flex", flexDirection: "column", gap: 2,
  }}>
    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{val}</div>
    <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.04em" }}>{label}</div>
  </div>
);

export const LossSparkline = ({ history }: { history: number[] }) => {
  if (!history || history.length === 0) return null;
  const max = Math.max(...history);
  const min = Math.min(...history);
  const H = 40, W = 200;
  const pts = history.map((v, i) => {
    const x = (i / (history.length - 1)) * W;
    const y = H - ((v - min) / (max - min || 1)) * (H - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 10, color: "#475569", fontFamily: "'Space Mono',monospace", marginBottom: 6, letterSpacing: "0.08em" }}>
        LOSS  {history[0]} → {history[history.length - 1]}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 40, overflow: "visible" }}>
        <polyline points={pts} fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinejoin="round" />
        {history.map((v, i) => {
          const x = (i / (history.length - 1)) * W;
          const y = H - ((v - min) / (max - min || 1)) * (H - 4) - 2;
          return <circle key={i} cx={x} cy={y} r={2.5} fill="#a78bfa" />;
        })}
      </svg>
    </div>
  );
};
