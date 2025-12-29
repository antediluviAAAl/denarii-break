// src/app/layout.js
import { Cinzel, Montserrat } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

// 1. Configure Cinzel (Display/Header Font)
const cinzel = Cinzel({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cinzel",
  display: 'swap',
});

// 2. Configure Montserrat (Body Font)
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: 'swap',
});

export const metadata = {
  title: "Denarii District",
  description: "A numismatic collection gallery.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* NETWORK OPTIMIZATION: Pre-connect to critical 3rd parties */}
        <link rel="preconnect" href="https://i.ibb.co" />
        <link rel="preconnect" href="https://ulqeoqjtwbmkzvnudbbv.supabase.co" /> 
      </head>
      {/* 3. Apply both font variables to the body */}
      <body className={`${cinzel.variable} ${montserrat.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}