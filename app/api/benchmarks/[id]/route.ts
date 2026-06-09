// CRUD for specific benchmark(e.g. [id])
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { evals } from "@/lib/schema";
import { requireEditor } from "@/lib/auth";
import { normalizeAssignees } from "@/lib/assignees";
import { eq } from "drizzle-orm";

// modify some column in specific benchmark
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
      "name", "status", "description", "url", "updatedAt", "tags", "assignees",
    ];
    for (const f of fields) if (f in body) updates[f] = body[f];
    if ("assignees" in body) updates.assignees = normalizeAssignees(body.assignees, session);

    const oldId = params.id;
    const newId = typeof body.id === "string" ? body.id.trim() : "";
    const renaming = newId.length > 0 && newId !== oldId;

    // if user want to rename -> search db first
    if (renaming) {
      const collide = await db
        .select({ id: evals.id })
        .from(evals)
        .where(eq(evals.id, newId))
        .limit(1);
      if (collide.length > 0) {
        return NextResponse.json(
          { error: `ID "${newId}" 已被其他 benchmark 使用` },
          { status: 409 }
        );
      }
      updates.id = newId;
    }
    
    // update db for user requested modifications
    const [updated] = await db
      .update(evals)
      .set(updates)
      .where(eq(evals.id, oldId))
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
  await db.delete(evals).where(eq(evals.id, params.id));
  return NextResponse.json({ ok: true });
}
