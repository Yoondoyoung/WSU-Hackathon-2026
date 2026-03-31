import { useState } from 'react';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { LeftPanel } from './components/LeftPanel/LeftPanel';
import { CenterPanel } from './components/CenterPanel/CenterPanel';
import { RightPanel } from './components/RightPanel/RightPanel';
import { useMapState } from './hooks/useMapState';
import { useProperties } from './hooks/useProperties';

export default function App() {
  const { mapState, setViewMode, toggleOverlay } = useMapState();
  const { properties, loading } = useProperties();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const handleSelectProperty = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleOpenPropertyDetail = (id: string) => {
    setSelectedId(id);
    setDetailId(id);
  };

  const handleClosePropertyDetail = () => {
    setDetailId(null);
  };

  return (
    <DashboardLayout
      left={
        <LeftPanel
          viewMode={mapState.viewMode}
          activeOverlays={mapState.activeOverlays}
          onViewChange={setViewMode}
          onOverlayToggle={toggleOverlay}
        />
      }
      center={
        <CenterPanel
          viewMode={mapState.viewMode}
          activeOverlays={mapState.activeOverlays}
          properties={properties}
          selectedId={selectedId}
          onSelectProperty={handleSelectProperty}
        />
      }
      right={
        <RightPanel
          properties={properties}
          loading={loading}
          selectedId={selectedId}
          onSelect={handleSelectProperty}
          detailId={detailId}
          onOpenDetail={handleOpenPropertyDetail}
          onCloseDetail={handleClosePropertyDetail}
        />
      }
    />
  );
}
