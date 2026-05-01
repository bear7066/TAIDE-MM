import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { globalTags } from "@/lib/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select()
    .from(globalTags)
    .orderBy(desc(globalTags.usageCount));
  return NextResponse.json(rows);
}
