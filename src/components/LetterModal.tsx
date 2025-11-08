"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

type LetterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  body?: ReactNode;
  footerNote?: string;
};

const ESCAPE_KEY = "Escape";

// LetterModal renders a stationary overlay featuring a pixel-inspired letter sheet.
export function LetterModal({ isOpen, onClose, title, body, footerNote }: LetterModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ESCAPE_KEY) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="letter-modal__overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "letter-modal-heading" : undefined}
        className="letter-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="letter-modal__hearts" aria-hidden>
          <span className="letter-modal__heart letter-modal__heart--tl">♥</span>
          <span className="letter-modal__heart letter-modal__heart--tr">♥</span>
          <span className="letter-modal__heart letter-modal__heart--bl">♥</span>
        </div>
        <button
          type="button"
          aria-label="Close letter"
          className="letter-modal__close"
          onClick={onClose}
        >
          ✕
        </button>

        {title ? (
          <h2 id="letter-modal-heading" className="letter-modal__title">
            {title}
          </h2>
        ) : null}

        <div className="letter-modal__body">
          {body ?? (
            <p>
              The café appreciates your endless curiosity. More secret notes will appear once the birthday surprise is ready to share.
            </p>
          )}
        </div>

        {footerNote ? <p className="letter-modal__footer">{footerNote}</p> : null}
      </div>
    </div>
  );
}
