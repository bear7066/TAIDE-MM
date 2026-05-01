import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { datasets } from "@/lib/schema";
import { requireEditor } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

// PATCH /api/datasets/:id - 更新
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
      "name", "modality", "status", "source", "samples", "baseModel",
      "description", "url", "updatedAt", "tags",
    ];
    for (const f of fields) {
      if (f in body) updates[f] = body[f];
    }

    const oldId = params.id;
    const newId = typeof body.id === "string" ? body.id.trim() : "";
    const renaming = newId.length > 0 && newId !== oldId;

    if (renaming) {
      const collide = await db
        .select({ id: datasets.id })
        .from(datasets)
        .where(eq(datasets.id, newId))
        .limit(1);
      if (collide.length > 0) {
        return NextResponse.json(
          { error: `ID "${newId}" 已被其他 dataset 使用` },
          { status: 409 }
        );
      }
      updates.id = newId;
    }

    const [updated] = await db
      .update(datasets)
      .set(updates)
      .where(eq(datasets.id, oldId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (renaming) {
      for (const tableName of ["tasks", "evals", "discussions"] as const) {
        await db.execute(sql`
          UPDATE ${sql.raw(tableName)}
          SET linked_datasets = COALESCE(
            (
              SELECT jsonb_agg(to_jsonb(CASE WHEN elem = ${oldId} THEN ${newId} ELSE elem END))
              FROM jsonb_array_elements_text(linked_datasets) AS elem
            ),
            '[]'::jsonb
          )
          WHERE linked_datasets @> jsonb_build_array(${oldId}::text)
        `);
      }
    }

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Failed to update" },
      { status: 500 }
    );
  }
}

// DELETE /api/datasets/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireEditor();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.delete(datasets).where(eq(datasets.id, params.id));
  return NextResponse.json({ ok: true });
}
