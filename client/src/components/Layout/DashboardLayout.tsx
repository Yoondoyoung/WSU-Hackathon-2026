import type { ReactNode } from 'react';

interface Props {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
}

export function DashboardLayout({ left, center, right }: Props) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0f0f1a]">
      {/* Left Panel */}
      <div className="w-[280px] flex-shrink-0 flex flex-col bg-[#1a1a2e] border-r border-[#2d2d4a] overflow-y-auto">
        {left}
      </div>
      {/* Center Panel (Map) */}
      <div className="flex-1 relative min-w-0">
        {center}
      </div>
      {/* Right Panel */}
      <div className="w-[380px] flex-shrink-0 flex flex-col bg-[#1a1a2e] border-l border-[#2d2d4a] overflow-y-auto">
        {right}
      </div>
    </div>
  );
}
