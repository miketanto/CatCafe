import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { InventoryProvider } from "@/context/InventoryContext";
import { QuestProvider } from "@/context/QuestContext";
import { RecipeUnlocksProvider } from "@/context/RecipeUnlocksContext";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Virtual Cat Café",
  description: "A Gameboy-inspired nook for baking virtual treats with a pixel cat friend.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pixelFont.className} bg-[#fff9e6] text-[#4d3b8f]`}>
        <InventoryProvider>
          <QuestProvider>
            <RecipeUnlocksProvider>
              <div className="flex min-h-dvh flex-col">
                {children}
              </div>
            </RecipeUnlocksProvider>
          </QuestProvider>
        </InventoryProvider>
      </body>
    </html>
  );
}
