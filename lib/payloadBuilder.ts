// lib/payloadBuilder.ts

// ✅ Define a specific interface for the parameters
interface GenerateParameters {
  width?: number;
  height?: number;
  batchSize?: number;
  tiling?: boolean;
  seed?: number;
}

// ✅ Random Seed Generator (64-bit integer)
function generateRandomSeed(): number {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

// 📦 Text Mode Payload
export function buildTextModePayload(
  prompt: string,
  negativePrompt: string,
  parameters: GenerateParameters
) {
  return {
    inputs: {
      '709b98371964cf3b': {
        title: 'Positive Prompt',
        value: prompt,
      },
      ce7a36588b205151: {
        title: 'Negative Prompt',
        value: negativePrompt || '',
      },
      d9ffb92f3b894f8a: {
        title: 'Width',
        value: parameters.width ?? 1024,
      },
      ac9be93bce0b142a: {
        title: 'Height',
        value: parameters.height ?? 1024,
      },
      a05845b5bebf1025: {
        title: 'Batch Size',
        value: parameters.batchSize ?? 1,
      },
      '2930f202ea5a73b5': {
        title: 'Tiling',
        value: parameters.tiling ? 'enable' : 'disable',
      },
      bdf13c4d02b289e4: {
        title: 'InstaSD API Input - Seed',
        value: parameters.seed ?? generateRandomSeed(), // ✅ Use random seed
      },
    },
  };
}

// 📦 Image Mode Payload
export function buildImageModePayload(
  imageUrl: string,
  parameters: GenerateParameters
) {
  return {
    inputs: {
      '2db6b4bc5c088768': {
        title: 'Width',
        value: parameters.width ?? 1024,
      },
      '9336b9b70244786b': {
        title: 'Height',
        value: parameters.height ?? 1024,
      },
      e7d548ea7e3c5e27: {
        title: 'Batch Size',
        value: parameters.batchSize ?? 1,
      },
      b3d3b23a2e6f162a: {
        title: 'Image Url',
        value: imageUrl,
      },
      c2a233be477e8ae5: {
        title: 'Tiling',
        value: parameters.tiling ? 'enable' : 'disable',
      },
      ce20c1748ebbca11: {
        title: 'Seed',
        value: parameters.seed ?? generateRandomSeed(), // ✅ Use random seed
      },
    },
  };
}

// 📦 Clothing Mode Payload
export function buildClothingModePayload(
  segmentPrompt: string,
  garmentImageUrl: string,
  modelImageUrl: string
) {
  return {
    inputs: {
      '0102fe8e458dea8a': {
        title: 'Segment Prompt',
        value: segmentPrompt,
      },
      e4517b5e2c3fc1bc: {
        title: 'GARMENT IMAGE',
        value: garmentImageUrl,
      },
      dece75678d9c12b2: {
        title: 'MODEL IMAGE',
        value: modelImageUrl,
      },
    },
  };
}
