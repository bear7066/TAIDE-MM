"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import AuthButton from "./AuthButton";
import { DatasetCard, ModelCard, TaskCard, BenchmarkCard, DiscussionCard } from "./Cards";
import DatasetForm from "./DatasetForm";
import ModelForm from "./ModelForm";
import TaskForm from "./TaskForm";
import BenchmarkForm from "./BenchmarkForm";
import DiscussionForm from "./DiscussionForm";
import DiscussionThreadModal from "./DiscussionThreadModal";
// import PipelineTab from "./PipelineTab";
import { Button } from "./Modal";
import { STATUS_META } from "@/lib/tokens";
import type { Benchmark, Dataset, Model, Task, Discussion } from "@/lib/schema";

type Tab = "datasets" | "models" | "tasks" | "benchmarks" | "discussions";

export default function Dashboard() {
  const { data: session } = useSession();
  const canEdit = !!(session?.user as any)?.canEdit;
  // const canEdit = true // debug

  const [tab, setTab] = useState<Tab>("datasets");
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [assigneeUsers, setAssigneeUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [dsFilter, setDsFilter] = useState("all");
  const [taskFilter, setTaskFilter] = useState("all");
  const [benchmarkFilter, setBenchmarkFilter] = useState("all");
  const [discFilter, setDiscFilter] = useState("all");
  const [collapsedPlanned, setCollapsedPlanned] = useState(true);

  // Modals
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
  const [showDatasetForm, setShowDatasetForm] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [showModelForm, setShowModelForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingBenchmark, setEditingBenchmark] = useState<Benchmark | null>(null);
  const [showBenchmarkForm, setShowBenchmarkForm] = useState(false);
  const [editingDiscussion, setEditingDiscussion] = useState<Discussion | null>(null);
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);
  const [openDiscussionId, setOpenDiscussionId] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setLoadError("");
    try {
      // catch response error and show it on the screen instead of showing "Loading..." when sth's mulfunctioning 
      const readJson = async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          const message = text.match(/"message":"([^"]+)"/)?.[1] || res.statusText;
          throw new Error(`${url} failed (${res.status}): ${message}`);
        }
        return res.json();
      };

      const [d, m, t, e, dc, tg, au] = await Promise.all([
        readJson("/api/datasets"),
        readJson("/api/models"),
        readJson("/api/tasks"),
        readJson("/api/benchmarks"),
        readJson("/api/discussions"),
        readJson("/api/tags"),
        readJson("/api/assignees"),
      ]);
      setDatasets(d);
      setModels(m);
      setTasks(t);
      setBenchmarks(e);
      setDiscussions(dc);
      setTagSuggestions((tg || []).map((x: any) => x.name));
      setAssigneeUsers(au || []);
    } catch (e: any) {
      setLoadError(e.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const handleDelete = async (kind: string, id: string, name: string) => {
    if (!confirm(`確定要刪除「${name}」?`)) return;
    const res = await fetch(`/api/${kind}/${id}`, { method: "DELETE" });
    if (res.ok) reload();
    else alert("刪除失敗");
  };

  const handleAssign = async (kind: string, id: string, assignees: string[]) => {
    const res = await fetch(`/api/${kind}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignees }),
    });
    if (res.ok) reload();
    else alert("指派失敗");
  };

  const filteredDS = datasets.filter(d => {
    if (dsFilter === "all") return true;
    if (["video", "audio", "image", "text"].includes(dsFilter)) return d.modality === dsFilter;
    return d.status === dsFilter;
  });
  const filteredTasks = tasks.filter(t => taskFilter === "all" || t.status === taskFilter);
  const filteredBenchmarks = benchmarks.filter(e => benchmarkFilter === "all" || e.status === benchmarkFilter);
  const filteredDiscussions = discussions.filter(d => discFilter === "all" || d.status === discFilter);
  const openDiscussion = discussions.find(d => d.id === openDiscussionId) || null;

  const totalSamples = datasets.reduce((sum, d) => {
    const n = parseInt((d.samples || "").replace(/[^0-9]/g, ""));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);
  const dsDone = datasets.filter(d => d.status === "完成").length;
  const taskDone = tasks.filter(t => t.status === "完成").length;
  const taskWip = tasks.filter(t => t.status === "進行中").length;

  const tabs = [
    { id: "datasets" as Tab, label: "Datasets", count: datasets.length },
    { id: "models" as Tab, label: "Models", count: models.length },
    { id: "tasks" as Tab, label: "Tasks", count: tasks.length, wip: taskWip },
    { id: "benchmarks" as Tab, label: "Benchmarks", count: benchmarks.length },
    { id: "discussions" as Tab, label: "Discussions", count: discussions.length },
    // { id: "pipeline" as Tab, label: "Pipeline", count: 0 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* TOP NAV */}
      <div style={{
        height: 56, flexShrink: 0,
        background: "rgba(8,11,16,0.95)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center",
        padding: "0 28px", gap: 16,
        position: "relative", zIndex: 10,
      }}>
        {/* logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg,#60a5fa,#a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "white", fontFamily: "'Space Mono',monospace",
          }}>T</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Space Mono',monospace", color: "#f1f5f9", letterSpacing: "0.04em" }}>TAIDE</div>
            <div style={{ fontSize: 9, color: "#334155", fontFamily: "'Space Mono',monospace", letterSpacing: "0.08em", marginTop: -1 }}>MULTIMODAL</div>
          </div>
        </div>

        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)" }}></div>

        {/* tabs */}
        <div style={{ display: "flex", gap: 2 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 8,
              fontSize: 12, fontFamily: "'Space Grotesk',sans-serif", fontWeight: tab === t.id ? 600 : 400,
              background: tab === t.id ? "rgba(96,165,250,0.10)" : "transparent",
              border: `1px solid ${tab === t.id ? "rgba(96,165,250,0.25)" : "transparent"}`,
              color: tab === t.id ? "#60a5fa" : "#475569",
              cursor: "pointer", transition: "all 0.18s",
            }}>
              {t.label}
              {(t as any).count !== undefined && (
                <span style={{
                  fontSize: 9, fontFamily: "'Space Mono',monospace",
                  padding: "1px 5px", borderRadius: 4,
                  background: tab === t.id ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.05)",
                  color: tab === t.id ? "#60a5fa" : "#475569",
                }}>{(t as any).count}</span>
              )}
              {(t as any).wip > 0 && (
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#60a5fa", boxShadow: "0 0 5px #60a5fa" }}></span>
              )}
            </button>
          ))}
          <Link href="/note" style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 8,
            fontSize: 12, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 400,
            background: "transparent",
            border: "1px solid transparent",
            color: "#475569",
            cursor: "pointer", transition: "all 0.18s",
            textDecoration: "none",
          }}>
            Notes
          </Link>
        </div>

        {/* right */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 20, alignItems: "center" }}>
          {[
            { val: totalSamples > 0 ? `${(totalSamples / 1000).toFixed(0)}K+` : "—", label: "Total Samples" },
            { val: `${dsDone}/${datasets.length}`, label: "Datasets Done" },
            { val: `${taskDone}/${tasks.length}`, label: "Tasks Done" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Space Mono',monospace", color: "#f1f5f9" }}>{s.val}</div>
              <div style={{ fontSize: 9, color: "#334155", fontFamily: "'Space Mono',monospace", letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)" }}></div>
          <AuthButton session={session} />
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#475569", fontFamily: "'Space Mono',monospace", fontSize: 12 }}>
            Loading…
          </div>
        ) : loadError ? (
          <div style={{
            maxWidth: 760,
            margin: "48px auto",
            padding: 22,
            border: "1px solid rgba(244,114,182,0.24)",
            borderRadius: 12,
            background: "rgba(244,114,182,0.05)",
            color: "#f1f5f9",
          }}>
            <div style={{ fontSize: 10, color: "#f472b6", fontFamily: "'Space Mono',monospace", letterSpacing: "0.16em", marginBottom: 8 }}>LOAD ERROR</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Dashboard data failed to load</div>
            <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, fontFamily: "'Space Mono',monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {loadError}
            </div>
            <Button onClick={reload} style={{ marginTop: 18 }}>Retry</Button>
          </div>
        ) : (
          <>
            {/* DATASETS */}
            {tab === "datasets" && (
              <div>
                <SectionHeader
                  title="Dataset Collections"
                  filterValue={dsFilter}
                  onFilterChange={setDsFilter}
                  filters={[
                    { value: "all", label: "All" },
                    { value: "video", label: "▶ Video" },
                    { value: "audio", label: "♪ Audio" },
                    { value: "完成", label: "完成" },
                    { value: "計劃中", label: "計劃中" },
                  ]}
                  items={datasets}
                  canEdit={canEdit}
                  onAdd={() => { setEditingDataset(null); setShowDatasetForm(true); }}
                  addLabel="+ Dataset"
                />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(360px,1fr))", gap: 16 }}>
                  {filteredDS.map(d => (
                    <DatasetCard
                      key={d.id} d={d}
                      canEdit={canEdit}
                      assigneeUsers={assigneeUsers}
                      onAssign={(assignees) => handleAssign("datasets", d.id, assignees)}
                      onEdit={() => { setEditingDataset(d); setShowDatasetForm(true); }}
                      onDelete={() => handleDelete("datasets", d.id, d.name)}
                    />
                  ))}
                  {filteredDS.length === 0 && (
                    <EmptyState text="尚無資料集" canEdit={canEdit} onAdd={() => setShowDatasetForm(true)} />
                  )}
                </div>
              </div>
            )}

            {/* MODELS */}
            {tab === "models" && (
              <div>
                <SectionHeader
                  title="Model Collections"
                  items={models}
                  canEdit={canEdit}
                  onAdd={() => { setEditingModel(null); setShowModelForm(true); }}
                  addLabel="+ Model"
                />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(560px,1fr))", gap: 16 }}>
                  {models.map(m => (
                    <ModelCard
                      key={m.id} m={m}
                      canEdit={canEdit}
                      assigneeUsers={assigneeUsers}
                      onAssign={(assignees) => handleAssign("models", m.id, assignees)}
                      onEdit={() => { setEditingModel(m); setShowModelForm(true); }}
                      onDelete={() => handleDelete("models", m.id, m.name)}
                    />
                  ))}
                  {models.length === 0 && (
                    <EmptyState text="尚無模型" canEdit={canEdit} onAdd={() => setShowModelForm(true)} />
                  )}
                </div>
              </div>
            )}

            {/* TASKS */}
            {tab === "tasks" && (
              <div>
                <SectionHeader
                  title="Tasks"
                  filterValue={taskFilter}
                  onFilterChange={setTaskFilter}
                  filters={[
                    { value: "all", label: "All" },
                    { value: "進行中", label: "進行中" },
                    { value: "計劃中", label: "計劃中" },
                    { value: "等待中", label: "等待中" },
                    { value: "完成", label: "完成" },
                  ]}
                  items={tasks}
                  canEdit={canEdit}
                  onAdd={() => { setEditingTask(null); setShowTaskForm(true); }}
                  addLabel="+ Task"
                />

                {taskFilter === "all" ? (
                  <div style={{ display: "flex", gap: 16, alignItems: "start" }}>
                    {["進行中", "等待中", "完成", "計劃中"].map(status => {
                      const collapsed = status === "計劃中" && collapsedPlanned;
                      const count = tasks.filter(t => t.status === status).length;
                      return collapsed ? (
                        <div
                          key={status}
                          onClick={() => setCollapsedPlanned(false)}
                          title="展開計劃中"
                          style={{
                            width: 36, flexShrink: 0, alignSelf: "stretch",
                            minHeight: 120,
                            display: "flex", flexDirection: "column", alignItems: "center",
                            justifyContent: "flex-start", paddingTop: 14, gap: 10,
                            background: "rgba(255,255,255,0.02)",
                            border: `1px solid ${STATUS_META[status]?.border || "rgba(255,255,255,0.06)"}`,
                            borderRadius: 10, cursor: "pointer",
                            transition: "background 0.18s",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: STATUS_META[status]?.dot, boxShadow: `0 0 5px ${STATUS_META[status]?.dot}` }}></span>
                          <div style={{
                            writingMode: "vertical-rl", textOrientation: "mixed",
                            fontSize: 11, fontWeight: 600, color: STATUS_META[status]?.color,
                            fontFamily: "'Space Mono',monospace", letterSpacing: "0.06em",
                            userSelect: "none",
                          }}>{status} {count}</div>
                        </div>
                      ) : (
                        <div key={status} style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                            marginBottom: 12, paddingBottom: 10,
                            borderBottom: `1px solid ${STATUS_META[status]?.border || "rgba(255,255,255,0.06)"}`,
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_META[status]?.dot, boxShadow: `0 0 5px ${STATUS_META[status]?.dot}` }}></span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_META[status]?.color, fontFamily: "'Space Mono',monospace" }}>{status}</span>
                            <span style={{ fontSize: 10, color: "#334155", fontFamily: "'Space Mono',monospace", marginLeft: "auto" }}>{count}</span>
                            {status === "計劃中" && (
                              <button
                                onClick={() => setCollapsedPlanned(true)}
                                title="收合"
                                style={{
                                  width: 18, height: 18, borderRadius: 4, border: "none",
                                  background: "transparent", color: "#475569",
                                  cursor: "pointer", fontSize: 12, lineHeight: 1,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  padding: 0,
                                }}
                              >›</button>
                            )}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {tasks.filter(t => t.status === status).map(t => (
                              <TaskCard
                                key={t.id} t={t} datasets={datasets} models={models}
                                canEdit={canEdit}
                                assigneeUsers={assigneeUsers}
                                onAssign={(assignees) => handleAssign("tasks", t.id, assignees)}
                                onEdit={() => { setEditingTask(t); setShowTaskForm(true); }}
                                onDelete={() => handleDelete("tasks", t.id, t.name)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 14 }}>
                    {filteredTasks.map(t => (
                      <TaskCard
                        key={t.id} t={t} datasets={datasets} models={models}
                        canEdit={canEdit}
                        assigneeUsers={assigneeUsers}
                        onAssign={(assignees) => handleAssign("tasks", t.id, assignees)}
                        onEdit={() => { setEditingTask(t); setShowTaskForm(true); }}
                        onDelete={() => handleDelete("tasks", t.id, t.name)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* BENCHMARKS */}
            {tab === "benchmarks" && (
              <div>
                <SectionHeader
                  title="Benchmark Collections"
                  filterValue={benchmarkFilter}
                  onFilterChange={setBenchmarkFilter}
                  filters={[
                    { value: "all", label: "All" },
                    { value: "進行中", label: "進行中" },
                    { value: "完成", label: "完成" },
                    { value: "計劃中", label: "計劃中" },
                  ]}
                  items={benchmarks}
                  canEdit={canEdit}
                  onAdd={() => { setEditingBenchmark(null); setShowBenchmarkForm(true); }}
                  addLabel="+ Benchmark"
                />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(380px,1fr))", gap: 14 }}>
                  {filteredBenchmarks.map(e => (
                    <BenchmarkCard
                      key={e.id} e={e}
                      canEdit={canEdit}
                      assigneeUsers={assigneeUsers}
                      onAssign={(assignees) => handleAssign("benchmarks", e.id, assignees)}
                      onEdit={() => { setEditingBenchmark(e); setShowBenchmarkForm(true); }}
                      onDelete={() => handleDelete("benchmarks", e.id, e.name)}
                    />
                  ))}
                  {filteredBenchmarks.length === 0 && (
                    <EmptyState text="尚無 benchmark" canEdit={canEdit} onAdd={() => setShowBenchmarkForm(true)} />
                  )}
                </div>
              </div>
            )}

            {/* PIPELINE */}
            {/* {tab === "pipeline" && (
              <div>
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 10, color: "#334155", fontFamily: "'Space Mono',monospace", letterSpacing: "0.16em", marginBottom: 6 }}>WORKFLOW</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>Pipeline Overview</div>
                </div>
                <PipelineTab canEdit={canEdit} />
              </div>
            )} */}

            {/* DISCUSSIONS */}
            {tab === "discussions" && (
              <div>
                <SectionHeader
                  title="Discussions"
                  filterValue={discFilter}
                  onFilterChange={setDiscFilter}
                  filters={[
                    { value: "all", label: "All" },
                    { value: "進行中", label: "open" },
                    { value: "完成", label: "resolved" },
                    { value: "等待中", label: "archived" },
                  ]}
                  items={discussions}
                  canEdit={canEdit}
                  onAdd={() => { setEditingDiscussion(null); setShowDiscussionForm(true); }}
                  addLabel="+ Discussion"
                />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(420px,1fr))", gap: 14 }}>
                  {filteredDiscussions.map(d => (
                    <DiscussionCard
                      key={d.id} d={d}
                      datasets={datasets} models={models} tasks={tasks}
                      canEdit={canEdit}
                      assigneeUsers={assigneeUsers}
                      onAssign={(assignees) => handleAssign("discussions", d.id, assignees)}
                      onOpen={() => setOpenDiscussionId(d.id)}
                      onEdit={() => { setEditingDiscussion(d); setShowDiscussionForm(true); }}
                      onDelete={() => handleDelete("discussions", d.id, d.title)}
                    />
                  ))}
                  {filteredDiscussions.length === 0 && (
                    <EmptyState text="尚無 discussion" canEdit={canEdit} onAdd={() => setShowDiscussionForm(true)} />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODALS */}
      <DatasetForm
        open={showDatasetForm}
        onClose={() => setShowDatasetForm(false)}
        initial={editingDataset}
        suggestions={tagSuggestions}
        assigneeUsers={assigneeUsers}
        onSaved={reload}
      />
      <ModelForm
        open={showModelForm}
        onClose={() => setShowModelForm(false)}
        initial={editingModel}
        suggestions={tagSuggestions}
        assigneeUsers={assigneeUsers}
        onSaved={reload}
      />
      <TaskForm
        open={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        initial={editingTask}
        datasets={datasets}
        models={models}
        suggestions={tagSuggestions}
        assigneeUsers={assigneeUsers}
        onSaved={reload}
      />
      <BenchmarkForm
        open={showBenchmarkForm}
        onClose={() => setShowBenchmarkForm(false)}
        initial={editingBenchmark}
        suggestions={tagSuggestions}
        assigneeUsers={assigneeUsers}
        onSaved={reload}
      />
      <DiscussionForm
        open={showDiscussionForm}
        onClose={() => setShowDiscussionForm(false)}
        initial={editingDiscussion}
        datasets={datasets}
        models={models}
        tasks={tasks}
        suggestions={tagSuggestions}
        assigneeUsers={assigneeUsers}
        onSaved={reload}
      />
      <DiscussionThreadModal
        open={!!openDiscussion}
        discussion={openDiscussion}
        canEdit={canEdit}
        onClose={() => setOpenDiscussionId(null)}
        onSaved={reload}
      />
    </div>
  );
}

function SectionHeader({ label, title, filters, filterValue, onFilterChange, items, canEdit, onAdd, addLabel }: any) {
  const byStatus: Record<string, number> = {};
  items.forEach((i: any) => { byStatus[i.status] = (byStatus[i.status] || 0) + 1; });
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
      <div>
        <div style={{ fontSize: 10, color: "#334155", fontFamily: "'Space Mono',monospace", letterSpacing: "0.16em", marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>{title}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          {Object.entries(byStatus).map(([s, n]) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_META[s]?.dot || "#94a3b8", boxShadow: `0 0 5px ${STATUS_META[s]?.dot || "#94a3b8"}` }}></span>
              <span style={{ fontSize: 11, color: "#475569", fontFamily: "'Space Mono',monospace" }}>{s} <span style={{ color: "#94a3b8" }}>{n}</span></span>
            </div>
          ))}
          {canEdit && (
            <Button onClick={onAdd}>{addLabel}</Button>
          )}
        </div>
        {filters && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {filters.map((f: any) => (
              <button key={f.value} onClick={() => onFilterChange(f.value)}
                style={{
                  padding: "5px 12px", borderRadius: 8,
                  fontSize: 11, fontFamily: "'Space Mono',monospace",
                  background: filterValue === f.value ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${filterValue === f.value ? "rgba(96,165,250,0.35)" : "rgba(255,255,255,0.08)"}`,
                  color: filterValue === f.value ? "#60a5fa" : "#475569",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >{f.label}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ text, canEdit, onAdd }: any) {
  return (
    <div style={{
      gridColumn: "1 / -1",
      padding: "60px 20px", textAlign: "center",
      border: "1px dashed rgba(255,255,255,0.08)",
      borderRadius: 14,
      color: "#475569", fontFamily: "'Space Mono',monospace", fontSize: 12,
    }}>
      <div style={{ marginBottom: 12 }}>{text}</div>
      {canEdit && <Button onClick={onAdd}>+ 新增第一筆</Button>}
    </div>
  );
}
