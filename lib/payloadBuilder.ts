// lib/payloadBuilder.ts

export function buildTextModePayload(prompt: string, negativePrompt: string, parameters: any) {
  return {
    inputs: {
      "709b98371964cf3b": {
        title: "Positive Prompt",
        value: prompt,
      },
      "ce7a36588b205151": {
        title: "Negative Prompt",
        value: negativePrompt || "",
      },
      "d9ffb92f3b894f8a": {
        title: "Width",
        value: parameters.width || 1024,
      },
      "ac9be93bce0b142a": {
        title: "Height",
        value: parameters.height || 1024,
      },
      "a05845b5bebf1025": {
        title: "Batch Size",
        value: parameters.batchSize || 1,
      },
      "2930f202ea5a73b5": {
        title: "Tiling",
        value: parameters.tiling ? "enable" : "disable",
      },
      "bdf13c4d02b289e4": {
        title: "InstaSD API Input - Seed",
        value: 862135533978314,
      },
    },
  };
}
