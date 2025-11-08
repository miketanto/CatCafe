'use client';

import Image from "next/image";
import { useEffect, MouseEvent } from "react";
import { FRAME_GALLERIES, type FrameId } from "@/data/frameGalleries";

type FrameGalleryModalProps = {
  frameId: FrameId;
  onClose: () => void;
};

// FrameGalleryModal displays larger artwork when a wall frame is clicked.
export function FrameGalleryModal({ frameId, onClose }: FrameGalleryModalProps) {
  const gallery = FRAME_GALLERIES[frameId] ?? {
    title: "Gallery",
    images: [],
  };
  const titleId = `frame-gallery-title-${frameId}`;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="frame-gallery__overlay" role="presentation" onClick={handleOverlayClick}>
      <div
        className="frame-gallery__modal pixel-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="frame-gallery__close"
          onClick={onClose}
          aria-label="Close frame gallery"
        >
          ×
        </button>

        <h2 id={titleId} className="frame-gallery__title">
          {gallery.title}
        </h2>

        {gallery.description ? (
          <p className="frame-gallery__description">{gallery.description}</p>
        ) : null}

        {gallery.images.length > 0 ? (
          <ul className="frame-gallery__grid">
            {gallery.images.map((image, index) => (
              <li key={`${gallery.title}-${index}`} className="frame-gallery__item">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width ?? 320}
                  height={image.height ?? 320}
                  className="frame-gallery__image"
                />
                {image.caption ? (
                  <p className="frame-gallery__caption">{image.caption}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="frame-gallery__empty">
            No photos yet. Add entries to FRAME_GALLERIES in src/data/frameGalleries.ts when your images are ready.
          </p>
        )}
      </div>
    </div>
  );
}
