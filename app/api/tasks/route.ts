import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks, globalTags } from "@/lib/schema";
import { requireEditor } from "@/lib/auth";
import { normalizeAssignees } from "@/lib/assignees";
import { sql } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(tasks).orderBy(tasks.createdAt);
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
      .insert(tasks)
      .values({
        id: body.id,
        name: body.name,
        status: body.status || "計劃中",
        description: body.description || "",
        linkedDatasets: body.linkedDatasets || [],
        linkedModels: body.linkedModels || [],
        priority: body.priority || "medium",
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
