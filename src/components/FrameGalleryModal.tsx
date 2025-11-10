"use client";

import Image from "next/image";
import { useEffect, useState, MouseEvent } from "react";
import { createPortal } from "react-dom";
import { FRAME_GALLERIES, type FrameId } from "@/data/frameGalleries";

type FrameGalleryModalProps = {
  frameId: FrameId;
  onClose: () => void;
  isClueSolved?: boolean;
  clueHint?: string;
  solvedTreatName?: string;
};

// FrameGalleryModal displays larger artwork when a wall frame is clicked.
export function FrameGalleryModal({ frameId, onClose, isClueSolved = false, clueHint, solvedTreatName }: FrameGalleryModalProps) {
  const gallery = FRAME_GALLERIES[frameId] ?? {
    title: "Gallery",
    images: [],
  };
  const titleId = `frame-gallery-title-${frameId}`;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      setIsMounted(false);
    };
  }, [onClose]);

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div className="frame-gallery__overlay" role="presentation" onClick={handleOverlayClick}>
      <div
        className={`frame-gallery__modal pixel-modal ${
          isClueSolved ? "frame-gallery__modal--solved" : ""
        }`}
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

        {clueHint ? <p className="frame-gallery__clue-hint">{clueHint}</p> : null}
        {isClueSolved && solvedTreatName ? (
          <p className="frame-gallery__solution">Solution: {solvedTreatName}</p>
        ) : null}

        {gallery.images.length > 0 ? (
          <ul className="frame-gallery__list">
            {gallery.images.map((image, index) => (
              <li key={`${gallery.title}-${index}`} className="frame-gallery__list-item">
                <div className="frame-gallery__photo-block">
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
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="frame-gallery__empty">
            No photos yet. Add entries to FRAME_GALLERIES in src/data/frameGalleries.ts when your images are ready.
          </p>
        )}

        {gallery.description ? (
          <p className="frame-gallery__description">{gallery.description}</p>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
