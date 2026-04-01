import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function DashboardLayout({ children }: Props) {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0d1117]">
      {children}
    </div>
  );
}
