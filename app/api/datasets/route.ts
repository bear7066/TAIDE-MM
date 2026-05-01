import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { datasets, globalTags } from "@/lib/schema";
import { requireEditor } from "@/lib/auth";
import { sql } from "drizzle-orm";

// GET /api/datasets - 列出所有 datasets (公開)
export async function GET() {
  const rows = await db.select().from(datasets).orderBy(datasets.createdAt);
  return NextResponse.json(rows);
}

// POST /api/datasets - 新增 dataset (需要編輯權限)
export async function POST(req: NextRequest) {
  const session = await requireEditor();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 基本驗證
    if (!body.id || !body.name) {
      return NextResponse.json(
        { error: "id and name are required" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(datasets)
      .values({
        id: body.id,
        name: body.name,
        modality: body.modality || "video",
        status: body.status || "計劃中",
        source: body.source || "—",
        samples: body.samples || "—",
        baseModel: body.baseModel || "—",
        description: body.description || "",
        url: body.url || null,
        updatedAt: body.updatedAt || new Date().toISOString().slice(0, 7),
        tags: body.tags || [],
        createdBy: (session.user as any).githubLogin,
      })
      .returning();

    // 記錄 tags 到全域字典
    if (body.tags?.length) {
      await syncTags(body.tags);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Failed to create" },
      { status: 500 }
    );
  }
}

// 把 tags 加入全域字典 (重複的就 +1 使用次數)
async function syncTags(tags: string[]) {
  for (const tag of tags) {
    if (!tag.trim()) continue;
    await db
      .insert(globalTags)
      .values({ name: tag.trim() })
      .onConflictDoUpdate({
        target: globalTags.name,
        set: { usageCount: sql`${globalTags.usageCount} + 1` },
      });
  }
}
