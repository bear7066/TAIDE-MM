// 從原 dashboard.html 提煉的設計 tokens, 統一管理
export const MODALITY_META: Record<string, any> = {
  video: { label: "Video", color: "#60a5fa", bg: "rgba(96,165,250,0.10)", border: "rgba(96,165,250,0.25)", icon: "▶" },
  audio: { label: "Audio", color: "#f472b6", bg: "rgba(244,114,182,0.10)", border: "rgba(244,114,182,0.25)", icon: "♪" },
  image: { label: "Image", color: "#2dd4bf", bg: "rgba(45,212,191,0.10)", border: "rgba(45,212,191,0.25)", icon: "⬛" },
  text:  { label: "Text",  color: "#fbbf24", bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.25)",  icon: "T" },
};

export const STATUS_META: Record<string, any> = {
  "完成":   { color: "#34d399", bg: "rgba(52,211,153,0.10)",  border: "rgba(52,211,153,0.25)",  dot: "#34d399" },
  "進行中": { color: "#60a5fa", bg: "rgba(96,165,250,0.10)",  border: "rgba(96,165,250,0.25)",  dot: "#60a5fa", pulse: true },
  "計劃中": { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.20)", dot: "#94a3b8" },
  "等待中": { color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.20)",  dot: "#fbbf24" },
};

export const SOURCE_COLORS: Record<string, any> = {
  "Kinetics": { color: "#a78bfa", bg: "rgba(167,139,250,0.10)", border: "rgba(167,139,250,0.22)" },
  "WebVid":   { color: "#2dd4bf", bg: "rgba(45,212,191,0.10)",  border: "rgba(45,212,191,0.22)" },
  "—":        { color: "#475569", bg: "rgba(71,85,105,0.10)",   border: "rgba(71,85,105,0.20)" },
};

export const PRIORITY_META: Record<string, any> = {
  high:   { label: "High",   color: "#f472b6", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.2)" },
  medium: { label: "Medium", color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)" },
  low:    { label: "Low",    color: "#475569", bg: "rgba(71,85,105,0.08)",   border: "rgba(71,85,105,0.2)" },
};
