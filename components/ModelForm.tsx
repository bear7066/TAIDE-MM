"use client";

import { useState, useEffect } from "react";
import Modal, { Button, fieldStyle, labelStyle } from "./Modal";
import TagInput from "./TagInput";
import AssigneeInput from "./AssigneeInput";
import type { Model } from "@/lib/schema";

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: Model | null;
  suggestions: string[];
  assigneeUsers: string[];
  onSaved: () => void;
}

export default function ModelForm({ open, onClose, initial, suggestions, assigneeUsers, onSaved }: Props) {
  const isEdit = !!initial;
  const [form, setForm] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [lossText, setLossText] = useState("");
  const [stepsText, setStepsText] = useState("");

  useEffect(() => {
    const base = initial ? {
      id: initial.id, name: initial.name, status: initial.status,
      modality: initial.modality, baseModel: initial.baseModel || "—",
      params: initial.params || "—", precision: initial.precision || "—",
      stage: initial.stage || "—", finalLoss: initial.finalLoss || "—",
      steps: initial.steps || "—", trainData: initial.trainData || "—",
      hardware: initial.hardware || "—", description: initial.description,
      url: initial.url || "", downloads: initial.downloads || "0",
      updatedAt: initial.updatedAt || "", tags: initial.tags || [],
      assignees: (initial as any).assignees || [],
      lossHistory: initial.lossHistory || [],
      lossSteps: initial.lossSteps || [],
    } : {
      id: "", name: "", status: "計劃中", modality: "video",
      baseModel: "—", params: "—", precision: "BF16",
      stage: "—", finalLoss: "—", steps: "—", trainData: "—",
      hardware: "—", description: "", url: "", downloads: "0",
      updatedAt: new Date().toISOString().slice(0, 7), tags: [],
      assignees: [],
      lossHistory: [], lossSteps: [],
    };
    setForm(base);
    setLossText((base.lossHistory || []).join(","));
    setStepsText((base.lossSteps || []).join(","));
    setErr("");
  }, [initial, open]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSubmitting(true);
    setErr("");
    try {
      // 解析 loss history / steps
      const parsed = {
        ...form,
        lossHistory: lossText.split(",").map(s => parseFloat(s.trim())).filter(n => !isNaN(n)),
        lossSteps: stepsText.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n)),
      };
      const url = isEdit ? `/api/models/${initial!.id}` : "/api/models";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
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
      title={isEdit ? `編輯 Model · ${initial?.name}` : "新增 Model"}
      width={680}
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
              ID
              {isEdit && <span style={{ marginLeft: 6, color: "#64748b", fontWeight: 400 }}>· 改 ID 會自動同步 task 連結</span>}
            </label>
            <input style={fieldStyle} value={form.id || ""} onChange={e => set("id", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Name</label>
            <input style={fieldStyle} value={form.name || ""} onChange={e => set("name", e.target.value)} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>Status</label>
            <select style={fieldStyle} value={form.status || "計劃中"} onChange={e => set("status", e.target.value)}>
              <option value="完成">完成</option><option value="進行中">進行中</option>
              <option value="計劃中">計劃中</option><option value="等待中">等待中</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Modality</label>
            <select style={fieldStyle} value={form.modality || "video"} onChange={e => set("modality", e.target.value)}>
              <option value="video">video</option><option value="audio">audio</option>
              <option value="image">image</option><option value="text">text</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Stage</label>
            <input style={fieldStyle} value={form.stage || ""} onChange={e => set("stage", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Updated</label>
            <input style={fieldStyle} value={form.updatedAt || ""} onChange={e => set("updatedAt", e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Base Model</label>
          <input style={fieldStyle} value={form.baseModel || ""} onChange={e => set("baseModel", e.target.value)} placeholder="google/gemma-3-4b-it" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>Params</label>
            <input style={fieldStyle} value={form.params || ""} onChange={e => set("params", e.target.value)} placeholder="5B" />
          </div>
          <div>
            <label style={labelStyle}>Precision</label>
            <input style={fieldStyle} value={form.precision || ""} onChange={e => set("precision", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Final Loss</label>
            <input style={fieldStyle} value={form.finalLoss || ""} onChange={e => set("finalLoss", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Steps</label>
            <input style={fieldStyle} value={form.steps || ""} onChange={e => set("steps", e.target.value)} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>Hardware</label>
            <input style={fieldStyle} value={form.hardware || ""} onChange={e => set("hardware", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Train Data</label>
            <input style={fieldStyle} value={form.trainData || ""} onChange={e => set("trainData", e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            style={{ ...fieldStyle, minHeight: 80, resize: "vertical", fontFamily: "'Noto Sans TC',sans-serif" }}
            value={form.description || ""}
            onChange={e => set("description", e.target.value)}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>HuggingFace URL</label>
            <input style={fieldStyle} value={form.url || ""} onChange={e => set("url", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Downloads</label>
            <input style={fieldStyle} value={form.downloads || ""} onChange={e => set("downloads", e.target.value)} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>Loss History (逗號分隔)</label>
            <input style={fieldStyle} value={lossText} onChange={e => setLossText(e.target.value)} placeholder="6.33,5.80,4.52,3.30,3.04" />
          </div>
          <div>
            <label style={labelStyle}>Loss Steps (逗號分隔)</label>
            <input style={fieldStyle} value={stepsText} onChange={e => setStepsText(e.target.value)} placeholder="10,50,100,200,300" />
          </div>
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
