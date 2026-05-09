"use client";

type Props = {
  value: string[];
  onChange: (assignees: string[]) => void;
  users: string[];
};

export default function AssigneeInput({ value = [], onChange, users = [] }: Props) {
  const selected = new Set((value || []).map(u => u.toLowerCase()));

  const toggle = (user: string) => {
    const normalized = user.toLowerCase();
    onChange(
      selected.has(normalized)
        ? value.filter(u => u.toLowerCase() !== normalized)
        : [...value, normalized]
    );
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {users.length === 0 && (
        <span style={{ fontSize: 11, color: "#475569", fontFamily: "'Space Mono',monospace" }}>
          尚無可指派 GitHub 使用者
        </span>
      )}
      {users.map(user => {
        const active = selected.has(user.toLowerCase());
        return (
          <button
            key={user}
            type="button"
            onClick={() => toggle(user)}
            style={{
              padding: "4px 8px", borderRadius: 6, fontSize: 10,
              fontFamily: "'Space Mono',monospace", cursor: "pointer",
              color: active ? "#34d399" : "#64748b",
              background: active ? "rgba(52,211,153,0.10)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${active ? "rgba(52,211,153,0.30)" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            {active ? "✓ " : ""}@{user}
          </button>
        );
      })}
    </div>
  );
}

export function AssigneeChips({ assignees = [] }: { assignees?: string[] }) {
  if (!assignees.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {assignees.map(user => (
        <span
          key={user}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 7px", borderRadius: 6, fontSize: 10,
            fontFamily: "'Space Mono',monospace",
            color: "#34d399", background: "rgba(52,211,153,0.08)",
            border: "1px solid rgba(52,211,153,0.20)",
          }}
        >
          @{user}
        </span>
      ))}
    </div>
  );
}

