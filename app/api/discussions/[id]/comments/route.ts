import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { discussions, type DiscussionComment } from "@/lib/schema";
import { requireEditor } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireEditor();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const text = typeof body.body === "string" ? body.body.trim() : "";
    if (!text) {
      return NextResponse.json({ error: "comment body is required" }, { status: 400 });
    }

    const [discussion] = await db
      .select()
      .from(discussions)
      .where(eq(discussions.id, params.id))
      .limit(1);

    if (!discussion) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const comment: DiscussionComment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      author:
        (session.user as any).githubLogin ||
        session.user?.name ||
        session.user?.email ||
        "unknown",
      body: text,
      createdAt: new Date().toISOString(),
    };

    const comments = [...(discussion.comments || []), comment];
    const [updated] = await db
      .update(discussions)
      .set({
        comments,
        updatedAt: new Date().toISOString().slice(0, 7),
      })
      .where(eq(discussions.id, params.id))
      .returning();

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
