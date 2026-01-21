import { Handle, Position, useReactFlow } from "reactflow";
import { Image as ImageIcon, UploadCloud } from "lucide-react";
import { NodeCard } from "./NodeCard";
import { FileUploader } from "../FileUploader";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export function UploadImageNode({ data, selected, id }: any) {
    const { setNodes } = useReactFlow();
    const [imageUrl, setImageUrl] = useState(data.imageUrl);
    const [showUploader, setShowUploader] = useState(false);

    const handleUploadComplete = useCallback((url: string) => {
        setImageUrl(url);
        setShowUploader(false);

        // ✅ Properly update React Flow node data
        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            imageUrl: url,
                        },
                    };
                }
                return node;
            })
        );

        toast.success('Image ready to use! 🎨');
    }, [id, setNodes]);

    const handleUploadError = useCallback((error: Error) => {
        console.error('Upload error in node:', error);
        toast.error(`Upload failed: ${error.message}`);
    }, []);

    const handleCancelUpload = useCallback(() => {
        setShowUploader(false);
        toast.info('Upload cancelled');
    }, []);

    return (
        <NodeCard
            title="Upload Image"
            icon={<ImageIcon size={16} />}
            selected={selected}
            color="bg-pink-500"
            status={data.status}
        >
            <div className="flex flex-col gap-2">
                {imageUrl ? (
                    <div className="relative w-full aspect-video rounded-md overflow-hidden border border-gray-100 bg-gray-50 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt="Uploaded" className="w-full h-full object-cover" />
                        <button
                            onClick={() => setShowUploader(true)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium cursor-pointer"
                        >
                            Replace Image
                        </button>
                    </div>
                ) : (
                    !showUploader ? (
                        <div
                            onClick={() => setShowUploader(true)}
                            className="w-full h-32 border-2 border-dashed border-gray-200 rounded-md flex flex-col items-center justify-center text-gray-400 hover:border-pink-400 hover:bg-pink-50 transition-colors cursor-pointer text-center p-4"
                        >
                            <UploadCloud size={24} className="mb-2 opacity-50" />
                            <span className="text-xs">
                                Click to Upload
                            </span>
                            <span className="text-[10px] mt-1 text-gray-300">JPG, PNG, WEBP</span>
                        </div>
                    ) : (
                        <div className="relative">
                            <FileUploader
                                allowedFileTypes={['image/*', '*/*']}
                                onComplete={handleUploadComplete}
                                placeholder="Click to Upload"
                                maxSizeMB={100}
                            />
                            <button
                                onClick={handleCancelUpload}
                                className="mt-2 w-full px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )
                )}
            </div>

            <Handle
                type="source"
                position={Position.Right}
                id="image:output"
                className="!bg-pink-500 !w-3 !h-3 !border-2 !border-white shadow-sm transition-transform hover:scale-125"
            />
        </NodeCard >
    );
}
