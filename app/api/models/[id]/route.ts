import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { models } from "@/lib/schema";
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
      "name", "status", "modality", "baseModel", "params", "precision",
      "stage", "finalLoss", "steps", "trainData", "hardware",
      "description", "url", "downloads", "lossHistory", "lossSteps",
      "updatedAt", "tags", "assignees",
    ];
    for (const f of fields) if (f in body) updates[f] = body[f];
    if ("assignees" in body) updates.assignees = normalizeAssignees(body.assignees, session);

    const oldId = params.id;
    const newId = typeof body.id === "string" ? body.id.trim() : "";
    const renaming = newId.length > 0 && newId !== oldId;

    if (renaming) {
      const collide = await db
        .select({ id: models.id })
        .from(models)
        .where(eq(models.id, newId))
        .limit(1);
      if (collide.length > 0) {
        return NextResponse.json(
          { error: `ID "${newId}" 已被其他 model 使用` },
          { status: 409 }
        );
      }
      updates.id = newId;
    }

    const [updated] = await db
      .update(models)
      .set(updates)
      .where(eq(models.id, oldId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (renaming) {
      for (const tableName of ["tasks", "evals", "discussions"] as const) {
        await db.execute(sql`
          UPDATE ${sql.raw(tableName)}
          SET linked_models = COALESCE(
            (
              SELECT jsonb_agg(to_jsonb(CASE WHEN elem = ${oldId} THEN ${newId} ELSE elem END))
              FROM jsonb_array_elements_text(linked_models) AS elem
            ),
            '[]'::jsonb
          )
          WHERE linked_models @> jsonb_build_array(${oldId}::text)
        `);
      }
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
  await db.delete(models).where(eq(models.id, params.id));
  return NextResponse.json({ ok: true });
}
