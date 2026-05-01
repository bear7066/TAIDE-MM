"use client";

import { useState, useEffect } from "react";
import Modal, { Button, fieldStyle, labelStyle } from "./Modal";
import TagInput from "./TagInput";
import type { Dataset } from "@/lib/schema";

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: Dataset | null;
  suggestions: string[];
  onSaved: () => void;
}

export default function DatasetForm({ open, onClose, initial, suggestions, onSaved }: Props) {
  const isEdit = !!initial;
  const [form, setForm] = useState<any>({
    id: "", name: "", modality: "video", status: "計劃中",
    source: "—", samples: "—", baseModel: "—",
    description: "", url: "", updatedAt: "", tags: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (initial) {
      setForm({
        id: initial.id, name: initial.name,
        modality: initial.modality, status: initial.status,
        source: initial.source || "—", samples: initial.samples || "—",
        baseModel: initial.baseModel || "—",
        description: initial.description, url: initial.url || "",
        updatedAt: initial.updatedAt || "",
        tags: initial.tags || [],
      });
    } else {
      setForm({
        id: "", name: "", modality: "video", status: "計劃中",
        source: "—", samples: "—", baseModel: "—",
        description: "", url: "",
        updatedAt: new Date().toISOString().slice(0, 7),
        tags: [],
      });
    }
    setErr("");
  }, [initial, open]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSubmitting(true);
    setErr("");
    try {
      const url = isEdit ? `/api/datasets/${initial!.id}` : "/api/datasets";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
      title={isEdit ? `編輯 Dataset · ${initial?.name}` : "新增 Dataset"}
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>
              ID (唯一)
              {isEdit && <span style={{ marginLeft: 6, color: "#64748b", fontWeight: 400 }}>· 改 ID 會自動同步 task 連結</span>}
            </label>
            <input
              style={fieldStyle}
              value={form.id}
              onChange={e => set("id", e.target.value)}
              placeholder="e.g. kinetics-40k"
            />
          </div>
          <div>
            <label style={labelStyle}>Name</label>
            <input
              style={fieldStyle}
              value={form.name}
              onChange={e => set("name", e.target.value)}
              placeholder="e.g. gemma-4-e4b-kinetics_40K"
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>Modality</label>
            <select style={fieldStyle} value={form.modality} onChange={e => set("modality", e.target.value)}>
              <option value="video">video</option>
              <option value="audio">audio</option>
              <option value="image">image</option>
              <option value="text">text</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select style={fieldStyle} value={form.status} onChange={e => set("status", e.target.value)}>
              <option value="完成">完成</option>
              <option value="進行中">進行中</option>
              <option value="計劃中">計劃中</option>
              <option value="等待中">等待中</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Source</label>
            <input style={fieldStyle} value={form.source} onChange={e => set("source", e.target.value)} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>Samples</label>
            <input style={fieldStyle} value={form.samples} onChange={e => set("samples", e.target.value)} placeholder="40K" />
          </div>
          <div>
            <label style={labelStyle}>Annotator / Base Model</label>
            <input style={fieldStyle} value={form.baseModel} onChange={e => set("baseModel", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Updated At</label>
            <input style={fieldStyle} value={form.updatedAt} onChange={e => set("updatedAt", e.target.value)} placeholder="2025-04" />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            style={{ ...fieldStyle, minHeight: 80, resize: "vertical", fontFamily: "'Noto Sans TC',sans-serif" }}
            value={form.description}
            onChange={e => set("description", e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>HuggingFace URL</label>
          <input style={fieldStyle} value={form.url} onChange={e => set("url", e.target.value)} placeholder="https://huggingface.co/datasets/..." />
        </div>

        <div>
          <label style={labelStyle}>Tags</label>
          <TagInput
            value={form.tags}
            onChange={v => set("tags", v)}
            suggestions={suggestions}
          />
        </div>
      </div>
    </Modal>
  );
}
