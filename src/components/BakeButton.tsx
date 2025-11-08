type BakeButtonProps = {
  onClick?: () => void;
};

// BakeButton triggers the modal-based baking workflow.
export function BakeButton({ onClick }: BakeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full max-w-sm items-center justify-center rounded-lg border-[3px] border-[#4d3b8f] bg-[#f8bcd4] px-6 py-4 text-sm uppercase tracking-[0.3em] text-[#4d3b8f] shadow-[0_4px_0_#4d3b8f] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4d3b8f]"
    >
      Bake Treats
    </button>
  );
}
