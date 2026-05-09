import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { discussions } from "@/lib/schema";
import { requireEditor } from "@/lib/auth";
import { normalizeAssignees } from "@/lib/assignees";
import { eq } from "drizzle-orm";

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
      "title", "body", "status", "linkedDatasets",
      "linkedModels", "linkedTasks", "updatedAt", "tags", "assignees",
    ];
    for (const f of fields) if (f in body) updates[f] = body[f];
    if ("assignees" in body) updates.assignees = normalizeAssignees(body.assignees, session);

    const oldId = params.id;
    const newId = typeof body.id === "string" ? body.id.trim() : "";
    const renaming = newId.length > 0 && newId !== oldId;

    if (renaming) {
      const collide = await db
        .select({ id: discussions.id })
        .from(discussions)
        .where(eq(discussions.id, newId))
        .limit(1);
      if (collide.length > 0) {
        return NextResponse.json(
          { error: `ID "${newId}" 已被其他 discussion 使用` },
          { status: 409 }
        );
      }
      updates.id = newId;
    }

    const [updated] = await db
      .update(discussions)
      .set(updates)
      .where(eq(discussions.id, oldId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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
  await db.delete(discussions).where(eq(discussions.id, params.id));
  return NextResponse.json({ ok: true });
}
