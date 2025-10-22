import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Central de Ajuda — Suvinil',
  description: 'FAQ da Suvinil com pesquisa, categorias e um chat de assistência.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
