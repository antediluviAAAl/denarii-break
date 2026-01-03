import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });

export const metadata = {
  title: "Denarii District",
  description: "A digital collection of ancient and modern coins",
};

// Note the 'modal' prop here
export default function RootLayout({ children, modal }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${cinzel.variable}`}>
        <Providers>
          {children}
          {modal}
        </Providers>
      </body>
    </html>
  );
}
