import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/schema";
import { requireEditor } from "@/lib/auth";
import { normalizeAssignees } from "@/lib/assignees";
import { eq, sql } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireEditor();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updates: any = {};
    const fields = [
      "name", "status", "description", "linkedDatasets",
      "linkedModels", "priority", "updatedAt", "tags", "assignees",
    ];
    for (const f of fields) if (f in body) updates[f] = body[f];
    if ("assignees" in body) updates.assignees = normalizeAssignees(body.assignees, session);

    const oldId = params.id;
    const newId = typeof body.id === "string" ? body.id.trim() : "";
    const renaming = newId.length > 0 && newId !== oldId;

    if (renaming) {
      const collide = await db
        .select({ id: tasks.id })
        .from(tasks)
        .where(eq(tasks.id, newId))
        .limit(1);
      if (collide.length > 0) {
        return NextResponse.json(
          { error: `ID "${newId}" 已被其他 task 使用` },
          { status: 409 }
        );
      }
      updates.id = newId;
    }

    const [updated] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, oldId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (renaming) {
      await db.execute(sql`
        UPDATE discussions
        SET linked_tasks = COALESCE(
          (
            SELECT jsonb_agg(to_jsonb(CASE WHEN elem = ${oldId} THEN ${newId} ELSE elem END))
            FROM jsonb_array_elements_text(linked_tasks) AS elem
          ),
          '[]'::jsonb
        )
        WHERE linked_tasks @> jsonb_build_array(${oldId}::text)
      `);
    }

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireEditor();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await db.delete(tasks).where(eq(tasks.id, params.id));
  return NextResponse.json({ ok: true });
}
