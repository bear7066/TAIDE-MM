import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pipelineImages } from "@/lib/schema";
import { requireEditor } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireEditor();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [img] = await db
    .select()
    .from(pipelineImages)
    .where(eq(pipelineImages.id, params.id))
    .limit(1);

  if (img?.imageUrl) {
    try {
      await unlink(path.join(process.cwd(), "public", img.imageUrl));
    } catch {}
  }

  await db.delete(pipelineImages).where(eq(pipelineImages.id, params.id));
  return NextResponse.json({ ok: true });
}
