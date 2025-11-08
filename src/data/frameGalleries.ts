export type FrameId = "frame-1" | "frame-2" | "frame-3";

export type FrameGalleryImage = {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
};

export type FrameGallery = {
  title: string;
  description?: string;
  images: FrameGalleryImage[];
};

export const FRAME_IDS: FrameId[] = ["frame-1", "frame-2", "frame-3"];

export const FRAME_GALLERIES: Record<FrameId, FrameGallery> = {
  "frame-1": {
    title: "Frame One",
    description: "Add photo entries by updating FRAME_GALLERIES in src/data/frameGalleries.ts.",
    images: [],
  },
  "frame-2": {
    title: "Frame Two",
    description: "Each image supports src, alt, optional caption, width, and height.",
    images: [],
  },
  "frame-3": {
    title: "Frame Three",
    description: "Place your assets under public/ and reference them here.",
    images: [],
  },
};
