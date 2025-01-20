import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is set in the .env file
});
const prompt = `
Analyze the print design on the garment visible in the provided image and provide a detailed description suitable for replication using digital art tools or AI models. Focus on the following aspects:

1. **Colors**:
  - Identify all prominent colors used in the print, including gradients or subtle shades.
  - Describe the background color and how it contrasts or blends with the print elements.

2. **Visual Elements**:
  - Describe all visible elements, such as:
    - **Floral Elements**: Include flower types, leaf shapes, stems, and vines (e.g., "rounded petals with pointed tips connected by curling vines").
    - **Geometric Patterns**: Mention shapes, arrangements, and symmetry (e.g., "overlapping circles forming a honeycomb pattern").
    - **Artistic Brushstrokes**: Detail stroke size, flow, curvature, and artistic style (e.g., "broad, sweeping strokes with rough edges in a calligraphic style").
    - **Abstract or Unique Graphics**: Highlight abstract designs, symbols, or unique artwork.
  - Specify any overlapping, layered, or combined elements.

3. **Patterns and Repetition**:
  - Describe how the design repeats across the garment (e.g., "a regular grid with evenly spaced motifs" or "freeform, scattered elements with no strict repetition").
  - Include details about the scale of the repetition (e.g., "small, densely packed patterns" or "large motifs spaced far apart").

4. **Arrangement**:
  - Explain how the elements are arranged:
    - Are they connected by lines, vines, or other elements?
    - Is the flow of the design vertical, horizontal, diagonal, or organic?
  - Mention symmetry or asymmetry in the arrangement.

5. **Textures**:
  - Describe any visible textures in the print (e.g., "a rough, hand-painted effect" or "smooth, vector-like patterns").
  - Include details like transparency, shading, or 3D effects.

6. **Artistic Style**:
  - Highlight the overall artistic style of the print (e.g., "realistic botanical illustration," "abstract expressionism," or "geometric minimalism").
  - Mention techniques like hand-drawn effects, digital precision, or watercolor aesthetics.

7. **Additional Features**:
  - Specify any unique visual characteristics, such as metallic or shimmering effects, gradients, or fine details.
  - If the print includes identifiable objects (e.g., animals, symbols), provide their names and describe their features.

Provide the description in a structured and detailed format for accurate reproduction using AI tools like Stable Diffusion.
`;

const systemPrompt = "You are a highly skilled AI specializing in analyzing garment prints and providing comprehensive descriptions to enable accurate digital reproduction. Your task is to focus on the visual details of the print, including colors, patterns, textures, styles, and arrangements, while ignoring unrelated garment features such as fabric type or garment fit."

export async function fetchOpenAIDescription(imageUrl: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Vision-capable model
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    const description = response.choices[0]?.message?.content.trim();
    if (!description) {
      throw new Error("No description returned from OpenAI");
    }

    return description;
  } catch (error) {
    console.error("Error communicating with OpenAI:", error);
    throw new Error("Failed to fetch description from OpenAI");
  }
}

export { openai };

