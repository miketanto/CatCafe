"use client";

import { useEffect } from "react";

type EntryOverlayProps = {
  isOpen: boolean;
  onDismiss: () => void;
};

export const ENTRY_OVERLAY_STORAGE_KEY = "cat-cafe-entry-welcome";

export function useEntryOverlayState(onSeen: () => void) {
  useEffect(() => {
    const hasSeen = typeof window !== "undefined" && window.localStorage.getItem(ENTRY_OVERLAY_STORAGE_KEY);
    if (!hasSeen) {
      return;
    }
    onSeen();
  }, [onSeen]);

  const markSeen = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ENTRY_OVERLAY_STORAGE_KEY, "1");
    }
  };

  return { markSeen };
}

export function EntryOverlay({ isOpen, onDismiss }: EntryOverlayProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="entry-overlay" role="presentation">
      <div className="entry-overlay__panel" role="dialog" aria-modal="true" aria-labelledby="entry-overlay-heading">
        <p className="entry-overlay__badge" aria-hidden>
          ✧ Welcome ✧
        </p>
        <h2 id="entry-overlay-heading" className="entry-overlay__title">
          Virtual Cat Café
        </h2>
        <p className="entry-overlay__body">
          Slip into the pastel lounge, brew a sweet treat, and uncover the clues our feline host stashes around the room. A celebration is on the horizon—help the cat get ready.
        </p>
        <button type="button" className="entry-overlay__button" onClick={onDismiss}>
          Enter the Café
        </button>
      </div>
    </div>
  );
}
