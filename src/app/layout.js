/* src/app/layout.js */
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });

export const metadata = {
  title: "Denarii District",
  description: "A digital collection of ancient and modern coins",
};

export default function RootLayout({ children, modal }) {
  return (
    // Add suppressHydrationWarning here
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${cinzel.variable}`}>
        <Providers>
          {children}
          {modal}
        </Providers>
      </body>
    </html>
  );
}