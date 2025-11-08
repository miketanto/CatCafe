"use client";

import Image from "next/image";
import { useMemo, useState, DragEvent } from "react";
import { useInventory } from "@/context/InventoryContext";
import { INVENTORY_DRAG_KEY } from "@/lib/inventoryDrag";

const INVENTORY_MODAL_TITLE_ID = "inventory-modal-heading";

type InventoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onFeed: (inventoryId: string) => void;
};

export function InventoryModal({ isOpen, onClose, onFeed }: InventoryModalProps) {
  const { items, isReady } = useInventory();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const sortedItems = useMemo(
    () =>
      [...items].sort((first, second) => second.acquiredAt - first.acquiredAt),
    [items]
  );

  if (!isOpen) {
    return null;
  }

  const handleRequestClose = () => {
    setDraggingId(null);
    onClose();
  };

  const handleDragStart = (event: DragEvent<HTMLElement>, inventoryId: string) => {
    event.dataTransfer.setData(INVENTORY_DRAG_KEY, inventoryId);
    event.dataTransfer.effectAllowed = "move";
    setDraggingId(inventoryId);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(onClose);
    } else {
      onClose();
    }
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const handleSpriteActivate = (inventoryId: string) => {
    onFeed(inventoryId);
    setDraggingId(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#4d3b8f]/60 px-4"
      role="presentation"
      onClick={handleRequestClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={INVENTORY_MODAL_TITLE_ID}
        className="pixel-modal inventory-modal relative flex w-full max-w-xl flex-col gap-4 overflow-y-auto px-6 py-7 text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close inventory"
          onClick={handleRequestClose}
          className="inventory-modal__close"
        >
          ✕
        </button>

        <h2
          id={INVENTORY_MODAL_TITLE_ID}
          className="inventory-modal__title text-[0.6rem] uppercase tracking-[0.35em]"
        >
          Inventory Shelves
        </h2>
        <p className="text-[0.6rem] leading-relaxed text-[#4d3b8f]/80">
          Drag a treat onto the cat or feed it directly from here.
        </p>

        {!isReady ? (
          <div className="inventory-modal__panel">
            Restocking your shelves...
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="inventory-modal__panel">
            <p className="text-[0.6rem]">No treats stored yet.</p>
            <p className="mt-3 text-[0.55rem] uppercase tracking-[0.3em] opacity-70">
              Bake something sweet to fill these shelves.
            </p>
          </div>
        ) : (
          <div className="inventory-modal__sprites" role="list">
            {sortedItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`inventory-sprite ${
                  draggingId === item.id ? "inventory-sprite--dragging" : ""
                }`}
                draggable
                onDragStart={(event) => handleDragStart(event, item.id)}
                onDragEnd={handleDragEnd}
                role="listitem"
                aria-label={`Drag ${item.treat.name} to feed the cat`}
                onClick={() => handleSpriteActivate(item.id)}
              >
                <Image
                  src={item.treat.sprite}
                  alt={item.treat.name}
                  width={72}
                  height={72}
                  className="image-render-pixel"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
