"use client";

import { useState, useEffect } from "react";
import Modal, { Button, fieldStyle, labelStyle } from "./Modal";
import TagInput from "./TagInput";
import type { Eval, Dataset, Model } from "@/lib/schema";

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: Eval | null;
  datasets: Dataset[];
  models: Model[];
  suggestions: string[];
  onSaved: () => void;
}

export default function EvalForm({ open, onClose, initial, datasets, models, suggestions, onSaved }: Props) {
  const isEdit = !!initial;
  const [form, setForm] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setForm(initial ? {
      id: initial.id, name: initial.name, status: initial.status,
      description: initial.description,
      linkedDatasets: initial.linkedDatasets || [],
      linkedModels: initial.linkedModels || [],
      metrics: initial.metrics || [],
      url: initial.url || "",
      updatedAt: initial.updatedAt || "",
      tags: initial.tags || [],
    } : {
      id: "", name: "", status: "計劃中", description: "",
      linkedDatasets: [], linkedModels: [],
      metrics: [],
      url: "",
      updatedAt: new Date().toISOString().slice(0, 7),
      tags: [],
    });
    setErr("");
  }, [initial, open]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const toggleLink = (key: "linkedDatasets" | "linkedModels", id: string) => {
    const cur: string[] = form[key] || [];
    set(key, cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]);
  };

  const addMetric = () => set("metrics", [...(form.metrics || []), { name: "", value: "" }]);
  const updateMetric = (i: number, k: "name" | "value", v: string) => {
    const ms = [...(form.metrics || [])];
    ms[i] = { ...ms[i], [k]: v };
    set("metrics", ms);
  };
  const removeMetric = (i: number) => {
    set("metrics", (form.metrics || []).filter((_: any, idx: number) => idx !== i));
  };

  const submit = async () => {
    setSubmitting(true);
    setErr("");
    try {
      const payload = {
        ...form,
        metrics: (form.metrics || []).filter((m: any) => m.name?.trim() || m.value?.trim()),
      };
      const url = isEdit ? `/api/evals/${initial!.id}` : "/api/evals";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || res.statusText);
      }
      onSaved();
      onClose();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `編輯 Eval · ${initial?.name}` : "新增 Eval"}
      width={640}
      footer={
        <>
          {err && <div style={{ marginRight: "auto", color: "#f472b6", fontSize: 11 }}>{err}</div>}
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "儲存中…" : isEdit ? "儲存" : "建立"}
          </Button>
        </>
      }
    >
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>
              ID
              {isEdit && <span style={{ marginLeft: 6, color: "#64748b", fontWeight: 400 }}>· 改 ID 安全</span>}
            </label>
            <input style={fieldStyle} value={form.id || ""} onChange={e => set("id", e.target.value)} placeholder="eval-1" />
          </div>
          <div>
            <label style={labelStyle}>Name</label>
            <input style={fieldStyle} value={form.name || ""} onChange={e => set("name", e.target.value)} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>Status</label>
            <select style={fieldStyle} value={form.status || "計劃中"} onChange={e => set("status", e.target.value)}>
              <option value="完成">完成</option><option value="進行中">進行中</option>
              <option value="計劃中">計劃中</option><option value="等待中">等待中</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Updated</label>
            <input style={fieldStyle} value={form.updatedAt || ""} onChange={e => set("updatedAt", e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            style={{ ...fieldStyle, minHeight: 70, resize: "vertical", fontFamily: "'Noto Sans TC',sans-serif" }}
            value={form.description || ""}
            onChange={e => set("description", e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>Result URL</label>
          <input style={fieldStyle} value={form.url || ""} onChange={e => set("url", e.target.value)} placeholder="https://wandb.ai/... 或 huggingface leaderboard" />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Metrics</label>
            <button
              type="button"
              onClick={addMetric}
              style={{
                padding: "3px 8px", borderRadius: 5, fontSize: 9,
                fontFamily: "'Space Mono',monospace", cursor: "pointer",
                color: "#60a5fa", background: "rgba(96,165,250,0.08)",
                border: "1px solid rgba(96,165,250,0.25)",
              }}
            >+ 加一筆</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(form.metrics || []).length === 0 && <div style={{ fontSize: 11, color: "#475569", fontFamily: "'Space Mono',monospace" }}>尚無指標</div>}
            {(form.metrics || []).map((m: any, i: number) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 6 }}>
                <input style={fieldStyle} value={m.name || ""} onChange={e => updateMetric(i, "name", e.target.value)} placeholder="BLEU" />
                <input style={fieldStyle} value={m.value || ""} onChange={e => updateMetric(i, "value", e.target.value)} placeholder="0.412" />
                <button
                  type="button"
                  onClick={() => removeMetric(i)}
                  style={{
                    padding: "0 10px", borderRadius: 6, fontSize: 11,
                    fontFamily: "'Space Mono',monospace", cursor: "pointer",
                    color: "#f472b6", background: "rgba(244,114,182,0.05)",
                    border: "1px solid rgba(244,114,182,0.2)",
                  }}
                >×</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Linked Datasets</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {datasets.length === 0 && <span style={{ fontSize: 11, color: "#475569" }}>尚無 dataset</span>}
            {datasets.map(d => {
              const sel = (form.linkedDatasets || []).includes(d.id);
              return (
                <button key={d.id} type="button" onClick={() => toggleLink("linkedDatasets", d.id)}
                  style={{
                    padding: "4px 8px", borderRadius: 6, fontSize: 10,
                    fontFamily: "'Space Mono',monospace", cursor: "pointer",
                    color: sel ? "#60a5fa" : "#475569",
                    background: sel ? "rgba(96,165,250,0.10)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${sel ? "rgba(96,165,250,0.3)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >{sel ? "✓ " : ""}▶ {d.name}</button>
              );
            })}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Linked Models</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {models.length === 0 && <span style={{ fontSize: 11, color: "#475569" }}>尚無 model</span>}
            {models.map(m => {
              const sel = (form.linkedModels || []).includes(m.id);
              return (
                <button key={m.id} type="button" onClick={() => toggleLink("linkedModels", m.id)}
                  style={{
                    padding: "4px 8px", borderRadius: 6, fontSize: 10,
                    fontFamily: "'Space Mono',monospace", cursor: "pointer",
                    color: sel ? "#a78bfa" : "#475569",
                    background: sel ? "rgba(167,139,250,0.10)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${sel ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >{sel ? "✓ " : ""}🧠 {m.name}</button>
              );
            })}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Tags</label>
          <TagInput value={form.tags || []} onChange={v => set("tags", v)} suggestions={suggestions} />
        </div>
      </div>
    </Modal>
  );
}
