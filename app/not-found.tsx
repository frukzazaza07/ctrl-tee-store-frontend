import Link from "next/link";
import "./globals.css";

export default function NotFound() {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col items-center justify-center gap-4 bg-bg text-fg">
        <p className="text-sm uppercase tracking-wide text-fg-muted">404</p>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <Link href="/" className="text-sm text-accent underline underline-offset-4">
          Go back home
        </Link>
      </body>
    </html>
  );
}
