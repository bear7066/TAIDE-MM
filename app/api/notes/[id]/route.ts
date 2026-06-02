import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notes } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const [note] = await db.select().from(notes).where(eq(notes.id, params.id));
  if (!note) {
    return NextResponse.json({ id: params.id, content: "", updatedAt: null, updatedBy: null });
  }
  return NextResponse.json(note);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { content } = await req.json();
  if (typeof content !== "string") {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }

  const session = await auth();
  const updatedBy = (session?.user as any)?.githubLogin ?? null;

  const [existing] = await db.select({ id: notes.id }).from(notes).where(eq(notes.id, params.id));
  let note;
  if (existing) {
    [note] = await db
      .update(notes)
      .set({ content, updatedAt: new Date(), updatedBy })
      .where(eq(notes.id, params.id))
      .returning();
  } else {
    [note] = await db
      .insert(notes)
      .values({ id: params.id, content, updatedBy })
      .returning();
  }

  return NextResponse.json(note);
}
