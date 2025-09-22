import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-pretendard',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FLOW : Startup Bridge',
  description: 'FLOW : Startup Bridge 모의투자시스템 ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={pretendard.variable}>
      <body className={`${pretendard.className} antialiased`}>{children}</body>
    </html>
  );
}
