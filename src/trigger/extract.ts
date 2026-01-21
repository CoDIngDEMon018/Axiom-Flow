
import { task } from "@trigger.dev/sdk/v3";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs from "fs";
import path from "path";
import os from "os";
import { uploadToTransloadit } from "./utils";
import https from "https";

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

type ExtractPayload = {
    videoUrl: string;
    timestamp?: string | number;
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

export const extractTask = task({
    id: "extract-task",
    retry: {
        maxAttempts: 3,
    },
    run: async (payload: ExtractPayload) => {
        const { videoUrl, timestamp = "0" } = payload;

        console.log("Starting extract task:", payload);

        const tmpDir = os.tmpdir();
        const inputPath = path.join(tmpDir, `input-${Date.now()}.mp4`);
        const filename = `frame-${Date.now()}.jpg`;
        const outputPath = path.join(tmpDir, filename);

        try {
            // 1. Download Video
            await downloadFile(videoUrl, inputPath);
            console.log("Downloaded video to:", inputPath);

            // 2. Extract Frame
            // fluent-ffmpeg screenshots method
            // timestamp can be "50%" or number (seconds)

            console.log("Extracting frame at:", timestamp);

            await new Promise<void>((resolve, reject) => {
                ffmpeg(inputPath)
                    .screenshots({
                        count: 1,
                        timestamps: [String(timestamp)],
                        folder: tmpDir,
                        filename: filename,
                    })
                    .on('end', () => resolve())
                    .on('error', (err) => reject(err));
            });
            console.log("Extracted frame saved to:", outputPath);

            // 3. Upload to Transloadit
            const url = await uploadToTransloadit(outputPath, 'frame.jpg');
            console.log("Uploaded result:", url);

            // Cleanup
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);

            return { url };

        } catch (error: any) {
            console.error("Extract Task Failed:", error);
            // Cleanup on error
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            throw error;
        }
    },
});
