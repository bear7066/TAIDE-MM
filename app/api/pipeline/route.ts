import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pipelineImages } from "@/lib/schema";
import { requireEditor } from "@/lib/auth";

export async function GET() {
  const rows = await db
    .select()
    .from(pipelineImages)
    .orderBy(pipelineImages.createdAt);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await requireEditor();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.id || !body.category || !body.imageUrl)
    return NextResponse.json({ error: "id, category, imageUrl required" }, { status: 400 });

  const [created] = await db
    .insert(pipelineImages)
    .values({
      id: body.id,
      category: body.category,
      title: body.title || "",
      imageUrl: body.imageUrl,
      createdBy: (session.user as any).githubLogin,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
