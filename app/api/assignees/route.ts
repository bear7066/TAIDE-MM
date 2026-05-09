import { NextResponse } from "next/server";
import { requireEditor } from "@/lib/auth";
import { getAssignableUsers } from "@/lib/assignees";

export async function GET() {
  const session = await requireEditor();
  if (!session) return NextResponse.json([]);
  return NextResponse.json(getAssignableUsers(session));
}
