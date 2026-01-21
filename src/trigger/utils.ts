
import { Transloadit } from "transloadit";

if (!process.env.NEXT_PUBLIC_TRANSLOADIT_KEY || !process.env.TRANSLOADIT_SECRET) {
    throw new Error("Transloadit credentials missing");
}

const transloadit = new Transloadit({
    authKey: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY,
    authSecret: process.env.TRANSLOADIT_SECRET,
});

export async function uploadToTransloadit(filePath: string, fileName: string): Promise<string> {
    try {
        // Use a generic assembly that imports the file and exports it to a public store (e.g. S3 which Transloadit usually defaults to or configured)
        // Since we don't know the exact template configuration, we'll try a simple valid upload assembly.
        // If the user has a specific template ID that handles "upload and store", we can use it.
        // Let's assume the template ID provided in env works for generic uploads or we try to use it.

        const options: any = {
            params: {
                steps: {
                    ":original": {
                        robot: "/upload/handle",
                    },
                    export: {
                        use: [":original"],
                        robot: "/file/serve", // or /s3/store if configured, but let's try to get the ssl_url from the assembly execution
                    }
                }
            }
        };

        // If template ID is available, maybe just use that? 
        // The one in env (58c0beb5...) was for "Blank" template which usually means "do nothing but handle upload".
        // Let's rely on that.
        if (process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID) {
            options.params.template_id = process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID;
            delete options.params.steps; // Let template handle steps if provided
        }

        const assembly: any = await transloadit.createAssembly({
            files: {
                [fileName]: filePath // Pass file path directly
            },
            params: options.params,
            waitForCompletion: true,
        });

        // Debug log
        console.log("Transloadit Assembly Response:", JSON.stringify(assembly, null, 2));

        if (assembly.error) {
            throw new Error(`Transloadit Assembly Error: ${assembly.error} - ${assembly.message}`);
        }

        // 1. Try to get result from 'results'
        const results = assembly.results || {};
        const keys = Object.keys(results);

        if (keys.length > 0) {
            const firstStep = keys[0];
            const file = results[firstStep][0];
            if (file && file.ssl_url) {
                return file.ssl_url;
            }
        }

        // 2. Fallback: Try to get from 'uploads' (often populated for simple storage templates)
        if (assembly.uploads && assembly.uploads.length > 0) {
            console.log("Using upload URL as fallback");
            return assembly.uploads[0].ssl_url;
        }

        throw new Error("No URL returned from Transloadit. Check assembly logs.");

    } catch (error: any) {
        console.error("Transloadit Upload Error:", error);
        throw new Error(`Failed to upload to Transloadit: ${error.message}`);
    }
}
