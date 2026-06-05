"use client";

import { useEffect, useRef, useState } from "react";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  linkPlugin,
  linkDialogPlugin,
  toolbarPlugin,
  diffSourcePlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertTable,
  InsertCodeBlock,
  DiffSourceToggleWrapper,
  ListsToggle,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

type SaveStatus = "saved" | "unsaved" | "saving";

export default function NotesEditorInner({ canEdit }: { canEdit: boolean }) {
  const editorRef = useRef<MDXEditorMethods>(null);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [lastSaved, setLastSaved] = useState("");
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/notes/main")
      .then(r => r.json())
      .then(data => {
        const c = data.content ?? "";
        setContent(c);
        setLastSaved(c);
        setUpdatedBy(data.updatedBy ?? null);
        setUpdatedAt(data.updatedAt ?? null);
        editorRef.current?.setMarkdown(c);
        setLoaded(true);
      });
  }, []);

  const save = async (text: string) => {
    setStatus("saving");
    try {
      const res = await fetch("/api/notes/main", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) {
        setStatus("unsaved");
        return;
      }
      const data = await res.json();
      setLastSaved(text);
      setUpdatedBy(data.updatedBy ?? null);
      setUpdatedAt(data.updatedAt ?? null);
      setStatus("saved");
    } catch {
      setStatus("unsaved");
    }
  };

  useEffect(() => {
    if (!loaded || !canEdit) return;
    const interval = setInterval(() => {
      setContent(cur => {
        if (cur !== lastSaved) {
          save(cur);
        }
        return cur;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [loaded, canEdit, lastSaved]);

  const handleChange = (md: string) => {
    setContent(md);
    setStatus("unsaved");
  };

  const statusColor = status === "saved" ? "#34d399" : status === "saving" ? "#60a5fa" : "#fbbf24";
  const statusLabel = status === "saved" ? "Saved" : status === "saving" ? "Saving…" : "Unsaved";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* header bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 16, flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 10, color: "#334155", fontFamily: "'Space Mono',monospace", letterSpacing: "0.16em", marginBottom: 6 }}>SHARED</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>Collaboration Notes</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {updatedBy && updatedAt && (
            <div style={{ fontSize: 10, color: "#475569", fontFamily: "'Space Mono',monospace", textAlign: "right" }}>
              <div>Last edit by <span style={{ color: "#94a3b8" }}>{updatedBy}</span></div>
              <div>{new Date(updatedAt).toLocaleString()}</div>
            </div>
          )}
          {canEdit && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 8,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${statusColor}33`,
              fontSize: 11, fontFamily: "'Space Mono',monospace",
              color: statusColor, transition: "color 0.3s",
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor, flexShrink: 0 }}></span>
              {statusLabel}
            </div>
          )}
        </div>
      </div>

      {/* editor */}
      <div className="notes-editor-wrap" style={{
        flex: 1, minHeight: 0,
        borderRadius: 12,
        border: "1px solid rgba(96,165,250,0.12)",
        overflow: "auto",
      }}>
        <MDXEditor
          ref={editorRef}
          markdown={content}
          readOnly={!canEdit}
          onChange={canEdit ? handleChange : undefined}
          contentEditableClassName="notes-editor-content"
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            tablePlugin(),
            codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
            codeMirrorPlugin({
              codeBlockLanguages: {
                "": "Plain Text",
                js: "JavaScript",
                ts: "TypeScript",
                tsx: "TSX",
                py: "Python",
                bash: "Bash",
                json: "JSON",
                md: "Markdown",
                sql: "SQL",
              },
            }),
            linkPlugin(),
            linkDialogPlugin(),
            diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: lastSaved }),
            markdownShortcutPlugin(),
            toolbarPlugin({
              toolbarContents: () => (
                <DiffSourceToggleWrapper>
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <BlockTypeSelect />
                  <ListsToggle />
                  <CreateLink />
                  <InsertTable />
                  <InsertCodeBlock />
                </DiffSourceToggleWrapper>
              ),
            }),
          ]}
        />
      </div>
    </div>
  );
}
