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
    title: "ZZZZ sleepy",
    description: "May u get a lot more rest (preferabbly like the photo) this year! 💤",
    images: [
      {
        src: "/room/Frame1_pic.JPG",
        alt: "Photo displayed in the first café frame",
      },
    ],
  },
  "frame-2": {
    title: "Prettiest Flower",
    description: "U are always the prettiest flower in a flower field and U get prettier everyday!🌸",
    images: [
      {
        src: "/room/Frame2_pic.JPG",
        alt: "Photo displayed in the second café frame",
      },
    ],
  },
  "frame-3": {
    title: "HEHEHE",
    description: "Hope 22 keeps you smiling and goofy :)",
    images: [
      {
        src: "/room/Frame3_pic.JPG",
        alt: "Photo displayed in the third café frame",
      },
    ],
  },
};
