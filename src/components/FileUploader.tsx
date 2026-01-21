"use client";

import React, { useEffect, useState } from 'react';
import Uppy from '@uppy/core';
import Dashboard from '@uppy/react/dashboard';
import Transloadit from '@uppy/transloadit';
import '@uppy/core/css/style.css';
import '@uppy/dashboard/css/style.css';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FileUploaderProps {
    allowedFileTypes: string[];
    onComplete: (url: string) => void;
    placeholder?: string;
    maxSizeMB?: number;
}

export function FileUploader({ allowedFileTypes, onComplete, maxSizeMB = 100 }: FileUploaderProps) {
    const [uppy] = useState(() => {
        const uppyInstance = new Uppy({
            restrictions: {
                maxFileSize: maxSizeMB * 1024 * 1024,
                allowedFileTypes: allowedFileTypes,
                maxNumberOfFiles: 1,
            },
            autoProceed: true,
        });

        uppyInstance.use(Transloadit, {
            assemblyOptions: {
                params: {
                    auth: { key: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY || '' },
                    template_id: process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID || '',
                },
            },
            waitForEncoding: true,
        });

        uppyInstance.on('transloadit:complete', (assembly) => {
            // Get the ssl_url from the first result of the conversion step or original
            // Usually assembly.results['step_name'][0].ssl_url
            // If we just have a store step, it might be roughly generic. 
            // We'll look for any result URL.
            const results = assembly.results;
            const keys = results ? Object.keys(results) : [];
            if (keys.length > 0) {
                const stepResults = results?.[keys[0]];
                if (stepResults && stepResults.length > 0) {
                    const firstResult = stepResults[0];
                    if (firstResult && firstResult.ssl_url) {
                        console.log('Transloadit upload complete:', firstResult.ssl_url);
                        onComplete(firstResult.ssl_url);
                    }
                }
            } else if (assembly.uploads && assembly.uploads.length > 0) {
                // Fallback if no step results (just upload)
                const upload = assembly.uploads[0];
                if (upload.ssl_url) {
                    onComplete(upload.ssl_url);
                }
            }
        });

        uppyInstance.on('transloadit:assembly-error', (assembly, error) => {
            console.error('Transloadit error:', error);
            toast.error(`Upload failed: ${error.message}`);
        });

        return uppyInstance;
    });

    if (!process.env.NEXT_PUBLIC_TRANSLOADIT_KEY || !process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID) {
        return (
            <div className="p-4 border border-red-200 bg-red-50 rounded-md text-sm text-red-600">
                <p className="font-bold">Configuration Missing</p>
                <p>Please set NEXT_PUBLIC_TRANSLOADIT_KEY and NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID in .env.local</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[200px]">
            <Dashboard
                uppy={uppy}
                hideUploadButton={true}
                width="100%"
                height={250}
                hideProgressDetails={false}
            />
        </div>
    );
}
