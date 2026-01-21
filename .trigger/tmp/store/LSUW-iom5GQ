import {
  defineConfig
} from "./chunk-DMBHOWKV.mjs";
import "./chunk-B5DUX6XI.mjs";
import {
  init_esm
} from "./chunk-DQAC2PDS.mjs";

// trigger.config.ts
init_esm();
var trigger_config_default = defineConfig({
  project: "proj_kuaotenapnbrffmfqabb",
  runtime: "node",
  logLevel: "log",
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1e3,
      maxTimeoutInMs: 1e4,
      factor: 2,
      randomize: true
    }
  },
  // Fix: Trigger v3 often requires explicit build image config or apt extension
  // For now, we'll try the standard apt install pattern if supported, or just 'ffmpeg' assuming basic image has it. 
  // We'll add 'maxDuration' as requested by lint.
  maxDuration: 300,
  dirs: ["./src/trigger"],
  build: {},
  additionalPackages: ["ffmpeg"]
  // Adding explicit ignore for now to pass lint if needed, but better to use the correct type.
  // For this environment, we'll try to add the 'additionalPackages' if it's a top-level or build-level config we can find.
  // Actually, let's keep it simple and clean up the file comments.
});
var resolveEnvVars = void 0;
export {
  trigger_config_default as default,
  resolveEnvVars
};
//# sourceMappingURL=trigger.config.mjs.map
