import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { discussions, globalTags } from "@/lib/schema";
import { requireEditor } from "@/lib/auth";
import { sql } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(discussions).orderBy(discussions.createdAt);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await requireEditor();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.id || !body.title) {
      return NextResponse.json(
        { error: "id and title are required" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(discussions)
      .values({
        id: body.id,
        title: body.title,
        body: body.body || "",
        status: body.status || "進行中",
        linkedDatasets: body.linkedDatasets || [],
        linkedModels: body.linkedModels || [],
        linkedTasks: body.linkedTasks || [],
        tags: body.tags || [],
        updatedAt: body.updatedAt || new Date().toISOString().slice(0, 7),
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
