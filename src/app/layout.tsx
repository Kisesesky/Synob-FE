import type { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';

const roboto = Roboto({
  subsets: ["latin"],
  weight: "300",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: 'Synob App',
  description: 'A simple clock, weather, and lock screen application.',
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Synob App',
  },
  // Favicon
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22 fill=%22black%22></text></svg>",
  },
};

import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${roboto.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  viewportFit: "cover",
};
