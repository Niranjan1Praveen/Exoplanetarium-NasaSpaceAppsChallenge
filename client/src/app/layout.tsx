import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/reusableComponents/navbar";

export { metadata, viewport } from "./metadata";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      {/* The site is dark-only: the class is fixed here rather than resolved
          at runtime, so there is no theme flash and no client theme provider. */}
      <html lang="en" className="dark" suppressHydrationWarning>
        <body suppressHydrationWarning>
          {/* Mounted once here so every route group — play, lab, explore —
              always has a way back to the homepage. */}
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
