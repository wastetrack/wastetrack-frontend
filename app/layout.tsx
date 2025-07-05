import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WasteTrack - Waste Management System',
  description: 'Efficient waste management tracking system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='id'>
      <body className={`${poppins.variable} font-poppins antialiased`}>
        {children}
        <Toaster
          position='top-right' // Bisa diadjust sesuai kebutuhan 
          richColors
          closeButton={false} // Menonaktifkan tombol close
          expand={true}
          theme='light' // Atur tema sesuai preferensi
        />
      </body>
    </html>
  );
}
