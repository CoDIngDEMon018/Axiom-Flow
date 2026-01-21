import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const MAX_SIZE = 150 * 1024 * 1024; // 150MB

export async function POST(request: NextRequest) {
    try {
        console.log("[UPLOAD] Starting upload request");

        const contentType = request.headers.get("content-type") || "";
        const filename = request.headers.get("x-filename") || `upload-${Date.now()}.bin`;

        let buffer: Buffer;

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            const file = formData.get("file") as File;
            if (!file) throw new Error("No file found in form data");
            buffer = Buffer.from(await file.arrayBuffer());
        } else {
            const arrayBuffer = await request.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
            console.log(`[UPLOAD] Read binary: ${buffer.length} bytes`);
        }

        const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
        const finalFilename = `${Date.now()}-${safeName}`;

        const uploadDir = join(process.cwd(), "public/uploads");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) { /* ignore */ }

        const filepath = join(uploadDir, finalFilename);
        await writeFile(filepath, buffer);
        console.log(`[UPLOAD] Saved to: ${filepath}`);

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const url = `${baseUrl}/uploads/${finalFilename}`;

        return NextResponse.json({ url, success: true });

    } catch (e: any) {
        console.error("[UPLOAD] ERROR:", e);
        return NextResponse.json({
            error: "Upload failed",
            details: e.message
        }, { status: 500 });
    }
}
