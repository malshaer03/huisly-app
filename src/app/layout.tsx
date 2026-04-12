import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "Miru — See all your money in one place",
  description: "Unified personal finance dashboard with AI chat for EU users",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.className} ${syne.className}`}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, interactive-widget=resizes-content"
        />
      </head>
      <body className="antialiased">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
