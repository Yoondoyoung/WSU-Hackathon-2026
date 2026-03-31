import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function DashboardLayout({ children }: Props) {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#070b14]">
      {children}
    </div>
  );
}
