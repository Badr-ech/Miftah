import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

// GeistSans and GeistMono are objects that directly provide .variable (a class name for CSS variable setup)
// and .className (a class name to directly apply the font).
// They are not functions to be called with options like next/font/google.
// The options like `variable` name and `subsets` are pre-configured by the geist library.

export const metadata: Metadata = {
  title: 'Miftah Platform',
  description: 'Educational platform for Morocco.',
  icons: {
    icon: '/favicon.ico', // Ensure this file exists in the public folder or remove/update path
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          GeistSans.variable, // Use the .variable property directly from the imported GeistSans object
          GeistMono.variable  // Use the .variable property directly from the imported GeistMono object
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
