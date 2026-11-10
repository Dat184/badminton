import type { Metadata, Viewport } from "next";
import { Archivo, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

// Preload the vietnamese subset so diacritics (ạ, ế, ữ...) don't briefly render in the fallback font.
const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

// Scoreboard numerals and board headings; the width axis gives the condensed cut.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "vietnamese"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: {
    default: "Cầu lông",
    template: "%s · Cầu lông",
  },
  description: "Lên lịch đánh cầu và chia tiền sân, nước, cầu cho cả nhóm.",
};

export const viewport: Viewport = {
  // Phone browser chrome matches the board band at the top of every page.
  themeColor: "#1e3fae",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${beVietnam.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
