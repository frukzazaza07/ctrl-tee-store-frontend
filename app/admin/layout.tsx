import type { ReactNode } from "react";
import "../globals.css";

export const metadata = {
  title: "CTRL TEE Admin",
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className="flex min-h-full flex-col bg-bg text-fg"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
