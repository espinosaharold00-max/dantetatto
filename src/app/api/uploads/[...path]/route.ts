import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "uploads");

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  tiff: "image/tiff",
  tif: "image/tiff",
  heic: "image/heic",
  heif: "image/heif",
  ico: "image/x-icon",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const filename = params.path.join("/");

  if (filename.includes("..") || filename.includes("\\")) {
    return NextResponse.json({ error: "Ruta inválida" }, { status: 400 });
  }

  const filepath = join(UPLOAD_DIR, filename);

  try {
    const info = await stat(filepath);
    if (!info.isFile()) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const buffer = await readFile(filepath);
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
}
