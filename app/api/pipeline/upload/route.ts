import { NextRequest, NextResponse } from "next/server";
import { requireEditor } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const session = await requireEditor();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file)
    return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase();
  const imageExts = ["jpg","jpeg","png","gif","webp","svg","avif","heic","heif","bmp","tiff","tif"];
  const isImage = file.type.startsWith("image/") || imageExts.includes(fileExt);
  if (!isImage)
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "public/uploads/pipeline");
  await mkdir(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/pipeline/${filename}` });
}
