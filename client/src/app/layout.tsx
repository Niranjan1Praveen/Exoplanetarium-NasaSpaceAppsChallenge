import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

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
        <body suppressHydrationWarning>{children}</body>
      </html>
    </ClerkProvider>
  );
}
