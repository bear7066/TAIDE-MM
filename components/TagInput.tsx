"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];  // 來自 /api/tags 的全域字典
  placeholder?: string;
}

export default function TagInput({ value, onChange, suggestions = [], placeholder }: Props) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 點外面收起建議清單
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (!t || value.includes(t)) {
      setInput("");
      return;
    }
    onChange([...value, t]);
    setInput("");
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter 或逗號 → 新增
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    // Backspace 在空輸入時 → 刪掉最後一個 tag
    else if (e.key === "Backspace" && !input && value.length) {
      removeTag(value[value.length - 1]);
    }
  };

  // 過濾建議:不顯示已加入的、且符合輸入字串
  const filteredSuggestions = suggestions
    .filter(s => !value.includes(s))
    .filter(s => !input || s.toLowerCase().includes(input.toLowerCase()))
    .slice(0, 8);

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: "flex", flexWrap: "wrap", gap: 5,
          padding: "8px 10px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          minHeight: 40,
          cursor: "text",
        }}
      >
        {value.map(tag => (
          <span key={tag} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "2px 6px", borderRadius: 4, fontSize: 10,
            fontFamily: "'Space Mono',monospace", letterSpacing: "0.06em",
            color: "#94a3b8", background: "rgba(96,165,250,0.10)",
            border: "1px solid rgba(96,165,250,0.2)",
          }}>
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              style={{
                background: "none", border: "none", color: "#60a5fa",
                cursor: "pointer", padding: 0, marginLeft: 2,
                fontSize: 12, lineHeight: 1,
              }}
            >×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKey}
          placeholder={value.length === 0 ? (placeholder || "輸入後按 Enter 或逗號") : ""}
          style={{
            flex: 1, minWidth: 100,
            background: "none", border: "none", outline: "none",
            color: "#f1f5f9", fontSize: 12,
            fontFamily: "'Space Mono',monospace",
          }}
        />
      </div>

      {/* 建議下拉 */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0,
          marginTop: 4,
          background: "#161c2a",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          zIndex: 100,
          maxHeight: 240, overflowY: "auto",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}>
          {filteredSuggestions.map(s => (
            <div
              key={s}
              onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
              style={{
                padding: "8px 12px", fontSize: 11,
                fontFamily: "'Space Mono',monospace",
                color: "#94a3b8", cursor: "pointer",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(96,165,250,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {s}
            </div>
          ))}
          {input && !suggestions.includes(input) && !value.includes(input) && (
            <div
              onMouseDown={(e) => { e.preventDefault(); addTag(input); }}
              style={{
                padding: "8px 12px", fontSize: 11,
                fontFamily: "'Space Mono',monospace",
                color: "#60a5fa", cursor: "pointer",
                background: "rgba(96,165,250,0.05)",
              }}
            >
              + 新增 “{input}”
            </div>
          )}
        </div>
      )}
    </div>
  );
}
