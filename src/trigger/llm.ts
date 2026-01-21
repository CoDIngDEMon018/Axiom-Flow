import { task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI } from "@google/generative-ai";

type LLMTaskPayload = {
    systemPrompt?: string;
    userMessage: string;
    imageUrls?: string[];
    model?: string;
};

export const llmTask = task({
    id: "llm-task",
    run: async (payload: LLMTaskPayload) => {
        const { systemPrompt, userMessage, imageUrls, model = "gemini-2.0-flash" } = payload;

        if (!process.env.GOOGLE_API_KEY) {
            throw new Error("Missing GOOGLE_API_KEY");
        }

        try {
            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
            const llm = genAI.getGenerativeModel({ model });

            const parts: any[] = [];

            if (systemPrompt) {
                parts.push({ text: `System: ${systemPrompt}\n\n` });
            }

            if (imageUrls && imageUrls.length > 0) {
                for (const url of imageUrls) {
                    try {
                        const imageResponse = await fetch(url);
                        const imageBuffer = await imageResponse.arrayBuffer();
                        const base64 = Buffer.from(imageBuffer).toString('base64');
                        const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

                        parts.push({
                            inlineData: {
                                data: base64,
                                mimeType,
                            }
                        });
                    } catch (err) {
                        console.error(`[LLM] Failed to fetch image: ${url}`, err);
                    }
                }
            }

            parts.push({ text: userMessage });

            const result = await llm.generateContent(parts);
            const response = result.response;
            const text = response.text();

            return {
                response: text,
                model,
            };

        } catch (error: any) {
            console.error("[LLM] Gemini API Error:", error);
            throw new Error(`Gemini API Failed: ${error.message}`);
        }
    },
});
