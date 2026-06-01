"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const EditorInner = dynamic<{ canEdit: boolean }>(
  () => import("./NotesEditorInner") as Promise<{ default: ComponentType<{ canEdit: boolean }> }>,
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: 40, textAlign: "center", color: "#475569", fontFamily: "'Space Mono',monospace", fontSize: 12 }}>
        Loading editor…
      </div>
    ),
  }
);

export default function NotesEditor({ canEdit }: { canEdit: boolean }) {
  return <EditorInner canEdit={canEdit} />;
}
