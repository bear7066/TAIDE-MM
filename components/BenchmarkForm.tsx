"use client";

import { useState, useEffect } from "react";
import Modal, { Button, fieldStyle, labelStyle } from "./Modal";
import TagInput from "./TagInput";
import AssigneeInput from "./AssigneeInput";
import type { Benchmark } from "@/lib/schema";

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: Benchmark | null;
  suggestions: string[];
  assigneeUsers: string[];
  onSaved: () => void;
}

export default function BenchmarkForm({ open, onClose, initial, suggestions, assigneeUsers, onSaved }: Props) {
  const isEdit = !!initial;
  const [form, setForm] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setForm(initial ? {
      id: initial.id, name: initial.name, status: initial.status,
      description: initial.description,
      url: initial.url || "",
      updatedAt: initial.updatedAt || "",
      tags: initial.tags || [],
      assignees: (initial as any).assignees || [],
    } : {
      id: "", name: "", status: "計劃中", description: "",
      url: "",
      updatedAt: new Date().toISOString().slice(0, 7),
      tags: [],
      assignees: [],
    });
    setErr("");
  }, [initial, open]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSubmitting(true);
    setErr("");
    try {
      const url = isEdit ? `/api/benchmarks/${initial!.id}` : "/api/benchmarks";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
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
      title={isEdit ? `編輯 Benchmark · ${initial?.name}` : "新增 Benchmark"}
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
            <input style={fieldStyle} value={form.id || ""} onChange={e => set("id", e.target.value)} placeholder="benchmark-1" />
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
          <label style={labelStyle}>Benchmark URL</label>
          <input style={fieldStyle} value={form.url || ""} onChange={e => set("url", e.target.value)} placeholder="https://huggingface.co/datasets/... 或 leaderboard URL" />
        </div>

        <div>
          <label style={labelStyle}>Assignees</label>
          <AssigneeInput value={form.assignees || []} onChange={v => set("assignees", v)} users={assigneeUsers} />
        </div>

        <div>
          <label style={labelStyle}>Tags</label>
          <TagInput value={form.tags || []} onChange={v => set("tags", v)} suggestions={suggestions} />
        </div>
      </div>
    </Modal>
  );
}
