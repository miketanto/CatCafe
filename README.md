## Virtual Cat Café

A mobile-first, Gameboy-inspired Next.js experience where a pixel companion waits for baked treats and future chiptune vibes.

### Tech Stack
- Next.js App Router (TypeScript)
- Tailwind CSS 4
- Google Press Start 2P font via `next/font`

### Key Screens & Components
- `src/app/page.tsx`: Home hub featuring the `CatDisplay`, `BakeButton`, bake modal trigger, and `MusicPlayer` placeholders.
- `src/components/BakeModal.tsx`: Modal-based Baking Corner with ingredient toggles, animated results, and inventory placeholder.
- `src/components/CatDisplay.tsx`: Pixel sprite viewport framed with inner shadows.
- `src/components/BakeButton.tsx`: Pixel-styled button that opens the baking modal.
- `src/components/MusicPlayer.tsx`: Reserved space for chiptune controls.
- `src/data/treatRecipes.ts`: Treat lookup table mapping ingredient combos to pixel sprites.

### Scripts
- `npm run dev` – Start the development server on `http://localhost:3000`.
- `npm run lint` – Run ESLint across the project.
- `npm run build` – Produce a production build.
- `npm run start` – Serve the production build.

### Getting Started
```bash
npm install
npm run dev
```

### Design Notes
- Palette: lilac `#bfa9ff`, mint `#c1f0d9`, cream `#fff9e6`, rose `#f8bcd4`.
- Layout: mobile-first column flow with blocky outlines and inset highlights.
- Typography: Press Start 2P applied globally for nostalgic pixel energy.

### Next Steps
- Wire up the baking workflow and treat inventory logic.
- Implement chiptune playback controls inside `MusicPlayer`.
- Add animations and micro-interactions respecting `prefers-reduced-motion`.
