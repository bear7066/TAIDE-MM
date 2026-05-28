"use client";

import { useEffect, useState } from "react";
import Modal, { Button, fieldStyle } from "./Modal";
import { AssigneeChips } from "./AssigneeInput";
import { StatusChip, Tag } from "./Chips";
import type { Discussion, DiscussionComment } from "@/lib/schema";

type Props = {
  open: boolean;
  discussion: Discussion | null;
  canEdit: boolean;
  onClose: () => void;
  onSaved: () => void;
};

function formatTime(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DiscussionThreadModal({ open, discussion, canEdit, onClose, onSaved }: Props) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    setMessage("");
    setErr("");
  }, [open, discussion?.id]);

  if (!discussion) return null;

  const comments = ((discussion as any).comments || []) as DiscussionComment[];

  const submit = async () => {
    const body = message.trim();
    if (!body) return;
    setSubmitting(true);
    setErr("");
    try {
      const res = await fetch(`/api/discussions/${discussion.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || res.statusText);
      }
      setMessage("");
      onSaved();
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
      title={discussion.title}
      width={820}
      footer={
        <>
          {err && <div style={{ marginRight: "auto", color: "#f472b6", fontSize: 11 }}>{err}</div>}
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateRows: "auto minmax(260px,1fr) auto", gap: 16 }}>
        <div style={{
          display: "grid", gap: 12,
          padding: 16, borderRadius: 10,
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <StatusChip s={discussion.status} />
            <span style={{ fontSize: 10, color: "#334155", fontFamily: "'Space Mono',monospace" }}>
              Updated {discussion.updatedAt}
            </span>
            <span style={{ fontSize: 10, color: "#475569", fontFamily: "'Space Mono',monospace" }}>
              {comments.length} comments
            </span>
          </div>
          {discussion.body && (
            <div style={{
              color: "#cbd5e1", fontSize: 12, lineHeight: 1.75,
              fontFamily: "'Noto Sans TC',sans-serif", whiteSpace: "pre-wrap",
            }}>
              {discussion.body}
            </div>
          )}
          <AssigneeChips assignees={(discussion as any).assignees || []} />
          {discussion.tags && discussion.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {discussion.tags.map(tag => <Tag key={tag} label={tag} />)}
            </div>
          )}
        </div>

        <div style={{
          display: "flex", flexDirection: "column", gap: 10,
          minHeight: 260, maxHeight: "42vh", overflowY: "auto",
          paddingRight: 4,
        }}>
          {comments.length === 0 ? (
            <div style={{
              height: 180, display: "flex", alignItems: "center", justifyContent: "center",
              color: "#475569", fontSize: 12, fontFamily: "'Space Mono',monospace",
              border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 10,
            }}>
              No comments yet
            </div>
          ) : comments.map(comment => (
            <div key={comment.id} style={{
              alignSelf: "stretch",
              padding: "10px 12px", borderRadius: 10,
              background: "rgba(15,23,42,0.72)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#38bdf8", fontFamily: "'Space Mono',monospace" }}>
                  @{comment.author}
                </span>
                <span style={{ fontSize: 10, color: "#475569", fontFamily: "'Space Mono',monospace" }}>
                  {formatTime(comment.createdAt)}
                </span>
              </div>
              <div style={{
                color: "#e2e8f0", fontSize: 12, lineHeight: 1.65,
                fontFamily: "'Noto Sans TC',sans-serif", whiteSpace: "pre-wrap",
              }}>
                {comment.body}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <textarea
            style={{
              ...fieldStyle,
              minHeight: 82,
              resize: "vertical",
              fontFamily: "'Noto Sans TC',sans-serif",
              lineHeight: 1.6,
            }}
            value={message}
            disabled={!canEdit || submitting}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
            }}
            placeholder={canEdit ? "Leave a comment..." : "Sign in with edit access to comment"}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontSize: 10, color: "#475569", fontFamily: "'Space Mono',monospace" }}>
              {canEdit ? "Cmd/Ctrl + Enter to send" : "Read only"}
            </span>
            <Button onClick={submit} disabled={!canEdit || submitting || !message.trim()}>
              {submitting ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
