export type CategoryKey = "CAMERA" | "MICROPHONE" | "LIGHTING";

export const EQUIPMENT: Record<
  CategoryKey,
  { label: string; blurb: string; presets: number[] }
> = {
  CAMERA: {
    label: "Camera",
    blurb: "Broadcast-quality cameras for the sanctuary and livestream.",
    presets: [500, 1000, 2500, 5000],
  },
  MICROPHONE: {
    label: "Microphone",
    blurb: "Wireless mics for the pulpit, choir, and praise team.",
    presets: [500, 1000, 2500, 5000],
  },
  LIGHTING: {
    label: "Lighting",
    blurb: "Stage and sanctuary lighting for clear, warm broadcasts.",
    presets: [500, 1000, 2500, 5000],
  },
};

export const CATEGORY_KEYS = Object.keys(EQUIPMENT) as CategoryKey[];
