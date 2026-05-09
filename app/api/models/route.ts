import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { models, globalTags } from "@/lib/schema";
import { requireEditor } from "@/lib/auth";
import { normalizeAssignees } from "@/lib/assignees";
import { sql } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(models).orderBy(models.createdAt);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await requireEditor();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.id || !body.name) {
      return NextResponse.json(
        { error: "id and name are required" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(models)
      .values({
        id: body.id,
        name: body.name,
        status: body.status || "計劃中",
        modality: body.modality || "video",
        baseModel: body.baseModel || "—",
        params: body.params || "—",
        precision: body.precision || "—",
        stage: body.stage || "—",
        finalLoss: body.finalLoss || "—",
        steps: body.steps || "—",
        trainData: body.trainData || "—",
        hardware: body.hardware || "—",
        description: body.description || "",
        url: body.url || null,
        downloads: body.downloads || "0",
        lossHistory: body.lossHistory || [],
        lossSteps: body.lossSteps || [],
        updatedAt: body.updatedAt || new Date().toISOString().slice(0, 7),
        tags: body.tags || [],
        assignees: normalizeAssignees(body.assignees, session),
        createdBy: (session.user as any).githubLogin,
      })
      .returning();

    if (body.tags?.length) {
      for (const tag of body.tags) {
        if (!tag.trim()) continue;
        await db.insert(globalTags).values({ name: tag.trim() })
          .onConflictDoUpdate({
            target: globalTags.name,
            set: { usageCount: sql`${globalTags.usageCount} + 1` },
          });
      }
    }

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
