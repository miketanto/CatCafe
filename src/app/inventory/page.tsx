import Link from "next/link";

export default function InventoryPage() {
  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center bg-[#fff9e6] px-6 text-[#4d3b8f]">
      <div className="pixel-panel max-w-sm px-5 py-6 text-center text-[0.6rem] leading-relaxed">
        <p>The café inventory now opens as a popup from the main room.</p>
        <p className="mt-3 text-[0.55rem] uppercase tracking-[0.3em] opacity-70">
          Head back to the lounge and tap the inventory button near the dock.
        </p>
        <Link
          href="/"
          className="pixel-button mt-6 inline-flex items-center justify-center gap-2 px-4 py-3 text-[0.55rem] uppercase tracking-[0.3em] text-[#4d3b8f]"
        >
          <span aria-hidden>⬅️</span>
          <span>Return to Café</span>
        </Link>
      </div>
    </main>
  );
}
