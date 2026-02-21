import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const SYSTEM_INSTRUCTION = `
You are an expert Email Marketing Designer and GrapesJS Architect.
**ROLE:** You assist users in creating high-converting email templates from scratch on a blank canvas.

### CAPABILITIES & SCALE
- The user is starting with a **BLANK CANVAS**.
- You must generate **COMPLETE SECTIONS** or **FULL TEMPLATES** based on the prompt.
- Focus on "Promotional Campaigns", "Newsletters", "Transactional Emails", etc.

### AVAILABLE BLOCKS (Use these HTML tags)
- **Layouts**: \`<div style="display:flex">\` (Rows), \`<div>\` (Columns).
- **Text**: \`<h1>\`, \`<h2>\`, \`<p>\`, \`<blockquote>\`.
- **Media**: \`<img>\` (Use specific URLs if provided, else placeholders).
- **Interactive**: \`<a href="#" style="...">\` (Buttons).
- **Structural**: \`<hr>\`, \`<ul>\`, \`<li>\`.

### IMAGE HANDLING
- The user message may contain image attachments.
- **CRITICAL:** The URLs of these images are provided in the [AVAILABLE IMAGES] block at the end of the message.
- You **MUST** use these exact URLs in the \`src\` attribute of your \`<img>\` tags when the user refers to them (e.g., "use the uploaded logo").

### PERSONALIZATION
- Use \`{{firstName}}\` for greetings.
- Use \`{{unsubscribeUrl}}\` in footers.
- Use \`{{companyName}}\` in headers/footers.

### OUTPUT FORMAT
- You must return a **JSON Object** with the following structure:
  \`{ "explanation": "Brief text description", "html": "The HTML code string" }\`
- The \`html\` field must contain valid HTML with **INLINE CSS**.
- Do not wrap the JSON in markdown code blocks. Return raw JSON.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Initialize Gemini Client
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    // Transform messages to Gemini format
    const contents = await Promise.all(
      messages.map(async (msg: any) => {
        const role = msg.role === "user" ? "user" : "model";

        let textContent = msg.content;

        // If images exist, append them to text content so Gemini knows the URLs for HTML generation

        if (msg.images && Array.isArray(msg.images) && msg.images.length > 0) {
          const imageList = msg.images.map((img: any) => img).join("\n");
          textContent += `\n\n[AVAILABLE IMAGES]:\n${imageList}`;
        }

        // Start with text part
        const parts: any[] = [{ text: textContent }];

        // If images exist, fetch and convert to base64
        if (msg.images && Array.isArray(msg.images)) {
          const imageSet = new Set();
          for (const imageUrl of msg.images) {
            try {
              if (imageSet.has(imageUrl)) continue;
              imageSet.add(imageUrl);
              const imageResponse = await fetch(imageUrl);
              if (!imageResponse.ok) continue;

              const arrayBuffer = await imageResponse.arrayBuffer();
              const base64Image = Buffer.from(arrayBuffer).toString("base64");
              const mimeType =
                imageResponse.headers.get("content-type") || "image/jpeg";

              parts.push({
                inlineData: {
                  mimeType,
                  data: base64Image,
                },
              });
            } catch (error) {
              console.error(`Failed to process image ${imageUrl}:`, error);
            }
          }
        }

        return { role, parts };
      }),
    );

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        responseMimeType: "application/json",
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
      },
      contents,
    });

    return NextResponse.json({ text: result.text });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
