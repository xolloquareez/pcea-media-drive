export type CategoryKey = "CAMERA" | "CAMERA_LENS" | "LIGHTING";

export const EQUIPMENT: Record
  CategoryKey,
  { label: string; blurb: string; presets: number[] }
> = {
  CAMERA: {
    label: "Camera",
    blurb: "Broadcast-quality cameras for the sanctuary and livestream.",
    presets: [500, 1000, 2500, 5000],
  },
  CAMERA_LENS: {
    label: "Camera Lens",
    blurb: "Interchangeable lenses for sharper, more dynamic shots.",
    presets: [500, 1000, 2500, 5000],
  },
  LIGHTING: {
    label: "Lighting",
    blurb: "Stage and sanctuary lighting for clear, warm broadcasts.",
    presets: [500, 1000, 2500, 5000],
  },
};

export const CATEGORY_KEYS = Object.keys(EQUIPMENT) as CategoryKey[];
