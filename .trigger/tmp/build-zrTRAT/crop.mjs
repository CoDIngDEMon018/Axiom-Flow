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

// src/trigger/crop.ts
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
var cropTask = task({
  id: "crop-task",
  retry: {
    maxAttempts: 3
  },
  run: /* @__PURE__ */ __name(async (payload) => {
    const { imageUrl, x = 0, y = 0, width = "100%", height = "100%" } = payload;
    console.log("Starting crop task:", payload);
    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `input-${Date.now()}.jpg`);
    const outputPath = path.join(tmpDir, `output-${Date.now()}.jpg`);
    try {
      await downloadFile(imageUrl, inputPath);
      console.log("Downloaded image to:", inputPath);
      const sW = String(width).replace("%", "") || "100";
      const sH = String(height).replace("%", "") || "100";
      const sX = String(x).replace("%", "") || "0";
      const sY = String(y).replace("%", "") || "0";
      const wExpr = `in_w*(${sW}/100)`;
      const hExpr = `in_h*(${sH}/100)`;
      const xExpr = `in_w*(${sX}/100)`;
      const yExpr = `in_h*(${sY}/100)`;
      const filterString = `crop=${wExpr}:${hExpr}:${xExpr}:${yExpr}`;
      console.log("Applying filter:", filterString);
      await new Promise((resolve, reject) => {
        (0, import_fluent_ffmpeg.default)(inputPath).outputOptions([`-vf ${filterString}`]).save(outputPath).on("end", () => resolve()).on("error", (err) => reject(err));
      });
      console.log("Cropped image saved to:", outputPath);
      const url = await uploadToTransloadit(outputPath, "cropped.jpg");
      console.log("Uploaded result:", url);
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
      return { url };
    } catch (error) {
      console.error("Crop Task Failed:", error);
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      throw error;
    }
  }, "run")
});
export {
  cropTask
};
//# sourceMappingURL=crop.mjs.map
