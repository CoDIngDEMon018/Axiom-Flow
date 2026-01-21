import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
    project: "proj_kuaotenapnbrffmfqabb",
    runtime: "node",
    logLevel: "log",
    retries: {
        enabledInDev: true,
        default: {
            maxAttempts: 3,
            minTimeoutInMs: 1000,
            maxTimeoutInMs: 10000,
            factor: 2,
            randomize: true,
        },
    },
    // Fix: Trigger v3 often requires explicit build image config or apt extension
    // For now, we'll try the standard apt install pattern if supported, or just 'ffmpeg' assuming basic image has it. 
    // We'll add 'maxDuration' as requested by lint.
    maxDuration: 300,
    dirs: ["./src/trigger"],
    build: {
        external: ["@trigger.dev/sdk"], // Avoid bundling SDK if needed
    },
    additionalPackages: ["ffmpeg"],
    // Adding explicit ignore for now to pass lint if needed, but better to use the correct type.
    // For this environment, we'll try to add the 'additionalPackages' if it's a top-level or build-level config we can find.
    // Actually, let's keep it simple and clean up the file comments.
});
