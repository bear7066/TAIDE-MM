"use client";

import { useState, useEffect, useRef } from "react";
import type { PipelineImage } from "@/lib/schema";

const CATEGORIES = [
  { id: "preprocessing", label: "資料前處理", icon: "⬡", color: "#60a5fa" },
  { id: "training",      label: "模型訓練",   icon: "⬡", color: "#a78bfa" },
  { id: "benchmark",     label: "Benchmark 設計", icon: "⬡", color: "#34d399" },
] as const;

const IMG_W = 340;
const IMG_H = 220;

interface Props {
  canEdit: boolean;
}

export default function PipelineTab({ canEdit }: Props) {
  const [images, setImages] = useState<PipelineImage[]>([]);
  const [uploading, setUploading] = useState<string | null>(null); // category being uploaded
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<PipelineImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingCategory = useRef<string>("");

  const reload = async () => {
    const rows = await fetch("/api/pipeline").then(r => r.json());
    setImages(Array.isArray(rows) ? rows : []);
  };

  useEffect(() => { reload(); }, []);

  const openPicker = (category: string) => {
    pendingCategory.current = category;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const category = pendingCategory.current;
    setUploading(category);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/pipeline/upload", { method: "POST", body: fd });
      if (!uploadRes.ok) { alert("上傳失敗"); return; }
      const { url } = await uploadRes.json();

      const id = `${category}-${Date.now()}`;
      const saveRes = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, category, imageUrl: url }),
      });
      if (!saveRes.ok) { alert("儲存失敗"); return; }
      await reload();
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (img: PipelineImage) => {
    if (!confirm(`確定要刪除這張圖片?`)) return;
    await fetch(`/api/pipeline/${img.id}`, { method: "DELETE" });
    await reload();
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Flow indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 36 }}>
        {CATEGORIES.map((cat, i) => (
          <div key={cat.id} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{
              flex: 1,
              padding: "10px 18px",
              background: `linear-gradient(135deg, ${cat.color}18, ${cat.color}08)`,
              border: `1px solid ${cat.color}30`,
              borderRadius: 10,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 11, fontFamily: "'Space Mono',monospace", color: cat.color, letterSpacing: "0.08em", fontWeight: 600 }}>
                STEP {i + 1}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginTop: 2 }}>
                {cat.label}
              </div>
              <div style={{ fontSize: 10, color: "#475569", fontFamily: "'Space Mono',monospace", marginTop: 2 }}>
                {images.filter(x => x.category === cat.id).length} 張圖
              </div>
            </div>
            {i < CATEGORIES.length - 1 && (
              <div style={{ width: 32, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="20" height="10" viewBox="0 0 20 10">
                  <polyline points="0,5 14,5" stroke="#334155" strokeWidth="1.5" fill="none" />
                  <polyline points="10,1 18,5 10,9" stroke="#334155" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {CATEGORIES.map(cat => {
          const catImages = images.filter(x => x.category === cat.id);
          const isUploading = uploading === cat.id;
          return (
            <div key={cat.id}>
              {/* Section header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 3, height: 20, borderRadius: 2,
                  background: `linear-gradient(180deg, ${cat.color}, ${cat.color}60)`,
                }}></div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>{cat.label}</div>
                <div style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 5,
                  background: `${cat.color}18`, border: `1px solid ${cat.color}30`,
                  color: cat.color, fontFamily: "'Space Mono',monospace",
                }}>
                  {catImages.length} images
                </div>
                {canEdit && (
                  <button
                    onClick={() => openPicker(cat.id)}
                    disabled={isUploading}
                    style={{
                      marginLeft: "auto",
                      padding: "6px 14px", borderRadius: 8,
                      fontSize: 11, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600,
                      background: isUploading ? "rgba(255,255,255,0.04)" : `${cat.color}18`,
                      border: `1px solid ${isUploading ? "rgba(255,255,255,0.08)" : `${cat.color}40`}`,
                      color: isUploading ? "#475569" : cat.color,
                      cursor: isUploading ? "default" : "pointer",
                      transition: "all 0.18s",
                    }}
                  >
                    {isUploading ? "上傳中…" : "+ 上傳圖片"}
                  </button>
                )}
              </div>

              {/* Image grid */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                {catImages.map(img => (
                  <div
                    key={img.id}
                    style={{ position: "relative", flexShrink: 0 }}
                    onMouseEnter={() => setHoveredId(img.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Fixed-size image container */}
                    <div
                      onClick={() => setLightbox(img)}
                      style={{
                        width: IMG_W, height: IMG_H,
                        borderRadius: 10,
                        overflow: "hidden",
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${hoveredId === img.id ? cat.color + "60" : "rgba(255,255,255,0.07)"}`,
                        cursor: "zoom-in",
                        transition: "border-color 0.18s",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.imageUrl}
                        alt={img.title || cat.label}
                        style={{
                          width: "100%", height: "100%",
                          objectFit: "contain",
                          display: "block",
                        }}
                      />
                    </div>

                    {/* Delete button on hover */}
                    {canEdit && hoveredId === img.id && (
                      <button
                        onClick={() => handleDelete(img)}
                        style={{
                          position: "absolute", top: 7, right: 7,
                          width: 24, height: 24, borderRadius: 6,
                          background: "rgba(239,68,68,0.85)",
                          border: "none", color: "white",
                          fontSize: 13, fontWeight: 700,
                          cursor: "pointer", display: "flex",
                          alignItems: "center", justifyContent: "center",
                          lineHeight: 1,
                        }}
                        title="刪除"
                      >×</button>
                    )}
                  </div>
                ))}

                {/* Upload placeholder */}
                {canEdit && (
                  <button
                    onClick={() => openPicker(cat.id)}
                    disabled={isUploading}
                    style={{
                      width: IMG_W, height: IMG_H,
                      borderRadius: 10, flexShrink: 0,
                      background: "rgba(255,255,255,0.02)",
                      border: `1.5px dashed rgba(255,255,255,0.10)`,
                      color: "#334155",
                      cursor: isUploading ? "default" : "pointer",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      gap: 8, transition: "all 0.18s",
                      fontFamily: "'Space Mono',monospace",
                    }}
                    onMouseEnter={e => {
                      if (!isUploading) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = cat.color + "50";
                        (e.currentTarget as HTMLButtonElement).style.color = cat.color;
                      }
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.10)";
                      (e.currentTarget as HTMLButtonElement).style.color = "#334155";
                    }}
                  >
                    <span style={{ fontSize: 28, lineHeight: 1 }}>+</span>
                    <span style={{ fontSize: 10 }}>上傳圖片</span>
                  </button>
                )}

                {catImages.length === 0 && !canEdit && (
                  <div style={{
                    width: IMG_W, height: IMG_H,
                    borderRadius: 10, flexShrink: 0,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px dashed rgba(255,255,255,0.07)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#334155", fontFamily: "'Space Mono',monospace", fontSize: 11,
                  }}>
                    尚無圖片
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
            zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.imageUrl}
              alt={lightbox.title || ""}
              style={{ maxWidth: "90vw", maxHeight: "86vh", borderRadius: 12, display: "block" }}
            />
            <button
              onClick={() => setLightbox(null)}
              style={{
                position: "absolute", top: -14, right: -14,
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#f1f5f9", fontSize: 16, fontWeight: 700,
                cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
              }}
            >×</button>
          </div>
        </div>
      )}
    </div>
  );
}
