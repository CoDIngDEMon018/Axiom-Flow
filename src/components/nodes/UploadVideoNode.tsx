import { Handle, Position, useReactFlow } from "reactflow";
import { Video, UploadCloud } from "lucide-react";
import { NodeCard } from "./NodeCard";
import { FileUploader } from "../FileUploader";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export function UploadVideoNode({ data, selected, id }: any) {
    const { setNodes } = useReactFlow();
    const [videoUrl, setVideoUrl] = useState(data.videoUrl);
    const [showUploader, setShowUploader] = useState(false);

    const handleUploadComplete = useCallback((url: string) => {
        setVideoUrl(url);
        setShowUploader(false);

        // ✅ Properly update React Flow node data
        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            videoUrl: url,
                        },
                    };
                }
                return node;
            })
        );

        toast.success('Video ready to use! 🎬');
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
            title="Upload Video"
            icon={<Video size={16} />}
            selected={selected}
            color="bg-sky-500"
            status={data.status}
        >
            <div className="flex flex-col gap-2">
                {videoUrl ? (
                    <div className="relative w-full aspect-video rounded-md overflow-hidden border border-gray-100 bg-black group">
                        <video src={videoUrl} className="w-full h-full object-cover" controls />
                        <button
                            onClick={() => setShowUploader(true)}
                            className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded text-[10px] hover:bg-black/80"
                            title="Replace Video"
                        >
                            Replace
                        </button>
                    </div>
                ) : (
                    !showUploader ? (
                        <div
                            onClick={() => setShowUploader(true)}
                            className="w-full h-32 border-2 border-dashed border-gray-200 rounded-md flex flex-col items-center justify-center text-gray-400 hover:border-sky-400 hover:bg-sky-50 transition-colors cursor-pointer text-center p-4"
                        >
                            <UploadCloud size={24} className="mb-2 opacity-50" />
                            <span className="text-xs">
                                Click to Upload
                            </span>
                            <span className="text-[10px] mt-1 text-gray-300">Max 100MB • MP4, MOV, WEBM</span>
                        </div>
                    ) : (
                        <div>
                            <FileUploader
                                allowedFileTypes={['video/*', '*/*']}
                                maxSizeMB={100}
                                onComplete={handleUploadComplete}
                                placeholder="Click to Upload Video"
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
                id="video:output"
                className="!bg-sky-500 !w-3 !h-3 !border-2 !border-white shadow-sm transition-transform hover:scale-125"
            />
        </NodeCard >
    );
}
