'use client';

import { Toaster, ToasterProps } from 'sonner';
import { useTheme } from 'next-themes';
export function ToasterWrapper() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="top-center"
      duration={3000}
      closeButton={true}
      theme={resolvedTheme as ToasterProps['theme']}
    />
  );
}
