import {
  require_ffmpeg,
  require_fluent_ffmpeg
} from "./chunk-KM2U7JQF.mjs";
import {
  uploadToTransloadit
} from "./chunk-6QO2NJTG.mjs";
import {
  task
} from "./chunk-OJNBOWJS.mjs";
import "./chunk-B5DUX6XI.mjs";
import "./chunk-BIWYZHAH.mjs";
import {
  __name,
  __toESM,
  init_esm
} from "./chunk-DQAC2PDS.mjs";

// src/trigger/extract.ts
init_esm();
var import_fluent_ffmpeg = __toESM(require_fluent_ffmpeg());
var import_ffmpeg = __toESM(require_ffmpeg());
import fs from "fs";
import path from "path";
import os from "os";
import https from "https";
import_fluent_ffmpeg.default.setFfmpegPath(import_ffmpeg.default.path);
async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", (err) => {
      fs.unlink(dest, () => {
      });
      reject(err);
    });
  });
}
__name(downloadFile, "downloadFile");
var extractTask = task({
  id: "extract-task",
  retry: {
    maxAttempts: 3
  },
  run: /* @__PURE__ */ __name(async (payload) => {
    const { videoUrl, timestamp = "0" } = payload;
    console.log("Starting extract task:", payload);
    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `input-${Date.now()}.mp4`);
    const filename = `frame-${Date.now()}.jpg`;
    const outputPath = path.join(tmpDir, filename);
    try {
      await downloadFile(videoUrl, inputPath);
      console.log("Downloaded video to:", inputPath);
      console.log("Extracting frame at:", timestamp);
      await new Promise((resolve, reject) => {
        (0, import_fluent_ffmpeg.default)(inputPath).screenshots({
          count: 1,
          timestamps: [String(timestamp)],
          folder: tmpDir,
          filename
        }).on("end", () => resolve()).on("error", (err) => reject(err));
      });
      console.log("Extracted frame saved to:", outputPath);
      const url = await uploadToTransloadit(outputPath, "frame.jpg");
      console.log("Uploaded result:", url);
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
      return { url };
    } catch (error) {
      console.error("Extract Task Failed:", error);
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      throw error;
    }
  }, "run")
});
export {
  extractTask
};
//# sourceMappingURL=extract.mjs.map
