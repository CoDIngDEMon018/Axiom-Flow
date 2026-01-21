
import { task } from "@trigger.dev/sdk/v3";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs from "fs";
import path from "path";
import os from "os";
import { uploadToTransloadit } from "./utils";
import https from "https";
import { text } from "stream/consumers";

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

type CropPayload = {
    imageUrl: string;
    x?: string | number;
    y?: string | number;
    width?: string | number;
    height?: string | number;
};

// Helper for simple download
async function downloadFile(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

export const cropTask = task({
    id: "crop-task",
    retry: {
        maxAttempts: 3,
    },
    run: async (payload: CropPayload) => {
        const { imageUrl, x = 0, y = 0, width = "100%", height = "100%" } = payload;

        console.log("Starting crop task:", payload);

        const tmpDir = os.tmpdir();
        const inputPath = path.join(tmpDir, `input-${Date.now()}.jpg`);
        const outputPath = path.join(tmpDir, `output-${Date.now()}.jpg`);

        try {
            // 1. Download Image
            await downloadFile(imageUrl, inputPath);
            console.log("Downloaded image to:", inputPath);

            // 2. Crop using ffmpeg
            // Filters format: "crop=w:h:x:y"
            // If percentages are used (e.g. "80%"), we might need valid ffmpeg syntax or parse them.
            // ffmpeg crop filter supports expressions like "in_w*0.5" for 50%.

            // Normalize inputs to strings for easy parsing check
            const sW = String(width).replace('%', '') || "100";
            const sH = String(height).replace('%', '') || "100";
            const sX = String(x).replace('%', '') || "0";
            const sY = String(y).replace('%', '') || "0";

            // Construct filter value assuming % input implies scaling relative to input size "in_w" / "in_h"
            // If pure number provided without %, assume pixels? Or percent? Assignment says "Configurable crop parameters (x%, y%, width%, height%)" implies percent is standard.
            // Let's assume input is 0-100.

            // w = in_w * (val/100)
            const wExpr = `in_w*(${sW}/100)`;
            const hExpr = `in_h*(${sH}/100)`;
            const xExpr = `in_w*(${sX}/100)`;
            const yExpr = `in_h*(${sY}/100)`;

            const filterString = `crop=${wExpr}:${hExpr}:${xExpr}:${yExpr}`;
            console.log("Applying filter:", filterString);

            await new Promise<void>((resolve, reject) => {
                ffmpeg(inputPath)
                    .outputOptions([`-vf ${filterString}`])
                    .save(outputPath)
                    .on('end', () => resolve())
                    .on('error', (err) => reject(err));
            });
            console.log("Cropped image saved to:", outputPath);

            // 3. Upload to Transloadit
            const url = await uploadToTransloadit(outputPath, 'cropped.jpg');
            console.log("Uploaded result:", url);

            // Cleanup
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);

            return { url };

        } catch (error: any) {
            console.error("Crop Task Failed:", error);
            // Cleanup on error
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            throw error;
        }
    },
});
