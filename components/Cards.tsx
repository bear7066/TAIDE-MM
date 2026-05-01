"use client";

import { useState } from "react";
import { Chip, ModalityChip, StatusChip, SourceChip, Tag, Metric, LossSparkline } from "./Chips";
import { PRIORITY_META } from "@/lib/tokens";
import type { Dataset, Model, Task, Eval, Discussion } from "@/lib/schema";

const EditButtons = ({ canEdit, onEdit, onDelete }: any) => {
  if (!canEdit) return null;
  return (
    <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        style={{
          padding: "3px 8px", borderRadius: 5, fontSize: 9,
          fontFamily: "'Space Mono',monospace", cursor: "pointer",
          color: "#94a3b8", background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >EDIT</button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        style={{
          padding: "3px 8px", borderRadius: 5, fontSize: 9,
          fontFamily: "'Space Mono',monospace", cursor: "pointer",
          color: "#f472b6", background: "rgba(244,114,182,0.05)",
          border: "1px solid rgba(244,114,182,0.2)",
        }}
      >DEL</button>
    </div>
  );
};

export const DatasetCard = ({ d, canEdit, onEdit, onDelete }: {
  d: Dataset; canEdit: boolean; onEdit: () => void; onDelete: () => void;
}) => {
  const [hov, setHov] = useState(false);
  const isPlanned = d.status === "計劃中";
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => d.url && window.open(d.url, "_blank")}
      style={{
        background: hov ? "#161c2a" : "#111620",
        border: `1px solid ${hov ? "rgba(96,165,250,0.28)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 14, padding: "22px 22px 18px",
        cursor: d.url ? "pointer" : "default",
        transition: "all 0.25s ease",
        opacity: isPlanned ? 0.7 : 1,
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? "0 12px 32px rgba(0,0,0,0.4)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <ModalityChip m={d.modality} />
          <StatusChip s={d.status} />
          <SourceChip src={d.source || "—"} />
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <EditButtons canEdit={canEdit} onEdit={onEdit} onDelete={onDelete} />
          {d.url && <span style={{ fontSize: 12, marginLeft: 6, color: hov ? "#60a5fa" : "#475569" }}>↗</span>}
        </div>
      </div>

      <div style={{
        fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700,
        color: "#f1f5f9", wordBreak: "break-all", marginBottom: 8, lineHeight: 1.5,
      }}>{d.name}</div>

      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, fontFamily: "'Noto Sans TC',sans-serif", fontWeight: 300, marginBottom: 14 }}>
        {d.description}
      </div>

      {!isPlanned && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          <Metric val={d.samples} label="samples" />
          <Metric val={d.baseModel} label="annotator" />
          <Metric val={d.source} label="source" />
        </div>
      )}

      {d.tags && d.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
          {d.tags.map(t => <Tag key={t} label={t} />)}
        </div>
      )}

      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: "#334155", fontFamily: "'Space Mono',monospace" }}>Updated {d.updatedAt}</span>
        {d.url && <span style={{ fontSize: 10, color: hov ? "#60a5fa" : "#334155", fontFamily: "'Space Mono',monospace", transition: "color 0.2s" }}>🤗 HuggingFace</span>}
      </div>
    </div>
  );
};

export const ModelCard = ({ m, canEdit, onEdit, onDelete }: {
  m: Model; canEdit: boolean; onEdit: () => void; onDelete: () => void;
}) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => m.url && window.open(m.url, "_blank")}
      style={{
        background: hov ? "#161c2a" : "#111620",
        border: `1px solid ${hov ? "rgba(167,139,250,0.28)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 14, padding: "22px",
        cursor: m.url ? "pointer" : "default",
        transition: "all 0.25s ease",
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? "0 12px 32px rgba(0,0,0,0.4)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <ModalityChip m={m.modality} />
          <StatusChip s={m.status} />
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <EditButtons canEdit={canEdit} onEdit={onEdit} onDelete={onDelete} />
          {m.url && <span style={{ fontSize: 12, marginLeft: 6, color: hov ? "#a78bfa" : "#475569" }}>↗</span>}
        </div>
      </div>

      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, color: "#f1f5f9", wordBreak: "break-all", marginBottom: 8 }}>{m.name}</div>
      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, fontFamily: "'Noto Sans TC',sans-serif", fontWeight: 300, marginBottom: 16 }}>{m.description}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          {[
            ["Base Model", m.baseModel],
            ["Stage", m.stage],
            ["Steps", m.steps],
            ["Hardware", m.hardware],
            ["Train Data", m.trainData],
          ].map(([k, v]) => (
            <div key={k as string} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize: 10, color: "#475569", fontFamily: "'Space Mono',monospace", letterSpacing: "0.05em" }}>{k}</span>
              <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'Space Mono',monospace" }}>{v}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            <Metric val={m.params} label="params" />
            <Metric val={m.precision} label="precision" />
            <Metric val={m.finalLoss} label="final loss" />
            <Metric val={m.downloads} label="downloads" />
          </div>
          {m.lossHistory && m.lossHistory.length > 0 && <LossSparkline history={m.lossHistory} />}
        </div>
      </div>

      {m.tags && m.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 14 }}>
          {m.tags.map(t => <Tag key={t} label={t} />)}
        </div>
      )}

      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: "#334155", fontFamily: "'Space Mono',monospace" }}>Updated {m.updatedAt}</span>
        {m.url && <span style={{ fontSize: 10, color: hov ? "#a78bfa" : "#334155", fontFamily: "'Space Mono',monospace", transition: "color 0.2s" }}>🤗 HuggingFace</span>}
      </div>
    </div>
  );
};

const LinkedRefs = ({ datasets, models, tasks, dsIds, mIds, tIds }: {
  datasets?: Dataset[]; models?: Model[]; tasks?: Task[];
  dsIds?: string[]; mIds?: string[]; tIds?: string[];
}) => {
  const ds = (datasets || []).filter(d => (dsIds || []).includes(d.id));
  const ms = (models || []).filter(m => (mIds || []).includes(m.id));
  const ts = (tasks || []).filter(t => (tIds || []).includes(t.id));
  if (ds.length + ms.length + ts.length === 0) return null;
  return (
    <div style={{ paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ fontSize: 10, color: "#334155", fontFamily: "'Space Mono',monospace", marginBottom: 8, letterSpacing: "0.08em" }}>LINKED RESOURCES</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {ds.map(d => (
          <span key={d.id} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 8px", borderRadius: 6, fontSize: 10,
            fontFamily: "'Space Mono',monospace",
            color: "#60a5fa", background: "rgba(96,165,250,0.08)",
            border: "1px solid rgba(96,165,250,0.2)", cursor: d.url ? "pointer" : "default",
          }} onClick={() => d.url && window.open(d.url, "_blank")}>▶ {d.name}</span>
        ))}
        {ms.map(m => (
          <span key={m.id} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 8px", borderRadius: 6, fontSize: 10,
            fontFamily: "'Space Mono',monospace",
            color: "#a78bfa", background: "rgba(167,139,250,0.08)",
            border: "1px solid rgba(167,139,250,0.2)", cursor: m.url ? "pointer" : "default",
          }} onClick={() => m.url && window.open(m.url, "_blank")}>🧠 {m.name}</span>
        ))}
        {ts.map(t => (
          <span key={t.id} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 8px", borderRadius: 6, fontSize: 10,
            fontFamily: "'Space Mono',monospace",
            color: "#fbbf24", background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.2)",
          }}>◆ {t.name}</span>
        ))}
      </div>
    </div>
  );
};

export const EvalCard = ({ e, datasets, models, canEdit, onEdit, onDelete }: {
  e: Eval; datasets: Dataset[]; models: Model[];
  canEdit: boolean; onEdit: () => void; onDelete: () => void;
}) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => e.url && window.open(e.url, "_blank")}
      style={{
        background: hov ? "#161c2a" : "#111620",
        border: `1px solid ${hov ? "rgba(52,211,153,0.28)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 14, padding: "20px",
        cursor: e.url ? "pointer" : "default",
        transition: "all 0.25s ease",
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? "0 12px 32px rgba(0,0,0,0.4)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <StatusChip s={e.status} />
          <Chip label="EVAL" color="#34d399" bg="rgba(52,211,153,0.10)" border="rgba(52,211,153,0.3)" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <EditButtons canEdit={canEdit} onEdit={onEdit} onDelete={onDelete} />
          {e.url && <span style={{ fontSize: 12, color: hov ? "#34d399" : "#475569" }}>↗</span>}
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 8 }}>{e.name}</div>
      {e.description && (
        <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, fontFamily: "'Noto Sans TC',sans-serif", fontWeight: 300, marginBottom: 14 }}>
          {e.description}
        </div>
      )}

      {e.metrics && e.metrics.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {e.metrics.map((m, i) => (
            <div key={i} style={{
              display: "inline-flex", alignItems: "baseline", gap: 6,
              padding: "5px 10px", borderRadius: 7,
              background: "rgba(52,211,153,0.06)",
              border: "1px solid rgba(52,211,153,0.2)",
            }}>
              <span style={{ fontSize: 10, color: "#475569", fontFamily: "'Space Mono',monospace", letterSpacing: "0.04em" }}>{m.name}</span>
              <span style={{ fontSize: 12, color: "#34d399", fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>{m.value}</span>
            </div>
          ))}
        </div>
      )}

      {e.tags && e.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
          {e.tags.map(t => <Tag key={t} label={t} />)}
        </div>
      )}

      <LinkedRefs datasets={datasets} models={models} dsIds={e.linkedDatasets} mIds={e.linkedModels} />

      <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: "#334155", fontFamily: "'Space Mono',monospace" }}>Updated {e.updatedAt}</span>
        {e.url && <span style={{ fontSize: 10, color: hov ? "#34d399" : "#334155", fontFamily: "'Space Mono',monospace" }}>📊 Result</span>}
      </div>
    </div>
  );
};

export const DiscussionCard = ({ d, datasets, models, tasks, canEdit, onEdit, onDelete }: {
  d: Discussion; datasets: Dataset[]; models: Model[]; tasks: Task[];
  canEdit: boolean; onEdit: () => void; onDelete: () => void;
}) => {
  const [hov, setHov] = useState(false);
  const [expand, setExpand] = useState(false);
  const isLong = (d.body || "").length > 200;
  const bodyToShow = expand || !isLong ? d.body : (d.body || "").slice(0, 200) + "…";
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#161c2a" : "#111620",
        border: `1px solid ${hov ? "rgba(251,191,36,0.22)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 14, padding: "20px",
        transition: "all 0.25s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <StatusChip s={d.status} />
          <Chip label="💬 DISCUSSION" color="#fbbf24" bg="rgba(251,191,36,0.10)" border="rgba(251,191,36,0.3)" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <EditButtons canEdit={canEdit} onEdit={onEdit} onDelete={onDelete} />
          <span style={{ fontSize: 10, color: "#334155", fontFamily: "'Space Mono',monospace" }}>{d.updatedAt}</span>
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 10 }}>{d.title}</div>

      {d.body && (
        <div style={{
          fontSize: 12, color: "#94a3b8", lineHeight: 1.75,
          fontFamily: "'Noto Sans TC',sans-serif", fontWeight: 300,
          whiteSpace: "pre-wrap", marginBottom: 12,
        }}>
          {bodyToShow}
          {isLong && (
            <button
              type="button"
              onClick={() => setExpand(!expand)}
              style={{
                marginLeft: 6, fontSize: 10, color: "#fbbf24",
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "'Space Mono',monospace",
              }}
            >{expand ? "收合" : "展開全文"}</button>
          )}
        </div>
      )}

      {d.tags && d.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
          {d.tags.map(tag => <Tag key={tag} label={tag} />)}
        </div>
      )}

      <LinkedRefs
        datasets={datasets} models={models} tasks={tasks}
        dsIds={d.linkedDatasets} mIds={d.linkedModels} tIds={d.linkedTasks}
      />
    </div>
  );
};

export const TaskCard = ({ t, datasets, models, canEdit, onEdit, onDelete }: {
  t: Task; datasets: Dataset[]; models: Model[];
  canEdit: boolean; onEdit: () => void; onDelete: () => void;
}) => {
  const [hov, setHov] = useState(false);
  const pm = PRIORITY_META[t.priority] || PRIORITY_META.medium;
  const linkedDS = datasets.filter(d => t.linkedDatasets.includes(d.id));
  const linkedM = models.filter(m => t.linkedModels.includes(m.id));
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#161c2a" : "#111620",
        border: `1px solid ${hov ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 14, padding: "20px",
        transition: "all 0.25s ease",
        transform: hov ? "translateY(-1px)" : "none",
        boxShadow: hov ? "0 8px 24px rgba(0,0,0,0.35)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <StatusChip s={t.status} />
          <Chip label={pm.label + " Priority"} color={pm.color} bg={pm.bg} border={pm.border} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <EditButtons canEdit={canEdit} onEdit={onEdit} onDelete={onDelete} />
          <span style={{ fontSize: 10, color: "#334155", fontFamily: "'Space Mono',monospace" }}>{t.updatedAt}</span>
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 8 }}>{t.name}</div>
      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, fontFamily: "'Noto Sans TC',sans-serif", fontWeight: 300, marginBottom: 14 }}>{t.description}</div>

      {t.tags && t.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
          {t.tags.map(tag => <Tag key={tag} label={tag} />)}
        </div>
      )}

      {(linkedDS.length > 0 || linkedM.length > 0) && (
        <div style={{ paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: 10, color: "#334155", fontFamily: "'Space Mono',monospace", marginBottom: 8, letterSpacing: "0.08em" }}>LINKED RESOURCES</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {linkedDS.map(d => (
              <span key={d.id} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "3px 8px", borderRadius: 6, fontSize: 10,
                fontFamily: "'Space Mono',monospace",
                color: "#60a5fa", background: "rgba(96,165,250,0.08)",
                border: "1px solid rgba(96,165,250,0.2)", cursor: d.url ? "pointer" : "default",
              }} onClick={() => d.url && window.open(d.url, "_blank")}>
                ▶ {d.name}
              </span>
            ))}
            {linkedM.map(m => (
              <span key={m.id} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "3px 8px", borderRadius: 6, fontSize: 10,
                fontFamily: "'Space Mono',monospace",
                color: "#a78bfa", background: "rgba(167,139,250,0.08)",
                border: "1px solid rgba(167,139,250,0.2)", cursor: m.url ? "pointer" : "default",
              }} onClick={() => m.url && window.open(m.url, "_blank")}>
                🧠 {m.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
