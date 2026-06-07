import './globals.css';
import type { ReactNode, ReactElement } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return children as ReactElement;
}
