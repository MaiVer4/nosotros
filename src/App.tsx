import React, { useState, useEffect } from 'react';
import type { RelationshipConfig, Memory, MediaItem, AdminTabId } from './types';
import { initialRelationshipConfig } from './data/relationshipData';
import {
  loadSiteConfiguration,
  saveConfigToLocalDB,
  clearLocalDB,
  hasUnpublishedChanges,
} from './utils/storageService';
import { LockScreen } from './components/LockScreen';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { VaioletSection } from './components/VaioletSection';
import { TimelineSection } from './components/TimelineSection';
import { LoveLettersSection } from './components/LoveLettersSection';
import { Footer } from './components/Footer';
import { MediaLightbox } from './components/MediaLightbox';
import { AddMemoryModal } from './components/AddMemoryModal';
import { FloatingHearts } from './components/FloatingHearts';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';

interface LightboxState {
  items: MediaItem[];
  index: number;
  contextTitle?: string;
  contextDate?: string;
}

export const App: React.FC = () => {
  // Master site configuration
  const [config, setConfig] = useState<RelationshipConfig>(() => initialRelationshipConfig);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Load configuration from IndexedDB / siteContent.json on start
  useEffect(() => {
    loadSiteConfiguration().then((loaded) => {
      setConfig(loaded);
      setHasUnsavedChanges(hasUnpublishedChanges());
    });
  }, []);

  // Visitor Unlock State (PIN)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('nosotros_unlocked') === 'true';
  });

  // Admin Authentication State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('nosotros_admin_unlocked') === 'true';
  });

  // Live Edit Mode State (✏️ buttons on the page)
  const [isLiveEditMode, setIsLiveEditMode] = useState<boolean>(() => {
    return localStorage.getItem('nosotros_live_edit_mode') === 'true';
  });

  // Modals & Panels State
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTabId>('portada');
  const [focusMemoryId, setFocusMemoryId] = useState<string | null>(null);
  const [focusLetterId, setFocusLetterId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Scoped Lightbox State
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const activeMedia = lightbox ? lightbox.items[lightbox.index] ?? null : null;

  // Save config handler (persists to IndexedDB & marks unpublished changes)
  const handleUpdateConfig = (
    updated: RelationshipConfig,
    markUnpublished = true
  ) => {
    setConfig(updated);
    saveConfigToLocalDB(updated, markUnpublished);
    setHasUnsavedChanges(markUnpublished);
  };

  const handleResetToDefaults = async () => {
    await clearLocalDB();
    setConfig(structuredClone(initialRelationshipConfig));
    setHasUnsavedChanges(false);
  };

  // Visitor Lock/Unlock
  const handleUnlockSite = () => {
    setIsUnlocked(true);
    localStorage.setItem('nosotros_unlocked', 'true');
  };

  const handleLockSite = () => {
    setIsUnlocked(false);
    localStorage.removeItem('nosotros_unlocked');
  };

  // Admin Management Actions
  const handleTriggerAdminButton = (tab?: AdminTabId) => {
    if (!isAdminUnlocked) {
      setIsAdminLoginOpen(true);
      return;
    }
    if (tab) setAdminTab(tab);
    setFocusMemoryId(null);
    setFocusLetterId(null);
    setIsAdminDashboardOpen(true);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminUnlocked(true);
    localStorage.setItem('nosotros_admin_unlocked', 'true');
    setIsAdminLoginOpen(false);
    setIsAdminDashboardOpen(true);
  };

  const handleLogoutAdmin = () => {
    setIsAdminUnlocked(false);
    setIsLiveEditMode(false);
    localStorage.removeItem('nosotros_admin_unlocked');
    localStorage.removeItem('nosotros_live_edit_mode');
    setIsAdminDashboardOpen(false);
  };

  const handleToggleLiveEdit = () => {
    const next = !isLiveEditMode;
    setIsLiveEditMode(next);
    localStorage.setItem('nosotros_live_edit_mode', String(next));
  };

  const handleOpenSectionInAdmin = (
    tab: AdminTabId,
    memoryId?: string,
    letterId?: string
  ) => {
    if (!isAdminUnlocked) {
      setIsAdminLoginOpen(true);
      return;
    }
    setAdminTab(tab);
    setFocusMemoryId(memoryId || null);
    setFocusLetterId(letterId || null);
    setIsAdminDashboardOpen(true);
  };

  // Memory operations
  const handleAddMemory = (newMemory: Memory) => {
    handleUpdateConfig({
      ...config,
      memories: [newMemory, ...config.memories],
    });
  };

  const handleDeleteMemory = (id: string) => {
    if (!confirm('¿Eliminar este recuerdo?')) return;
    handleUpdateConfig({
      ...config,
      memories: config.memories.filter((m) => m.id !== id),
    });
  };

  const handleToggleFavorite = (id: string) => {
    const updated = config.memories.map((m) =>
      m.id === id ? { ...m, isFavorite: !m.isFavorite } : m
    );
    handleUpdateConfig({
      ...config,
      memories: updated,
    });
  };

  // Letter operations
  const handleDeleteLetter = (id: string) => {
    if (!confirm('¿Eliminar esta carta secreta?')) return;
    handleUpdateConfig({
      ...config,
      letters: config.letters.filter((l) => l.id !== id),
    });
  };

  // Lightbox operations (scoped to active album/memory)
  const handleSelectMedia = (
    items: MediaItem[],
    index: number,
    context?: { title?: string; date?: string }
  ) => {
    if (!items || items.length === 0) return;
    const safeIdx = Math.max(0, Math.min(index, items.length - 1));
    setLightbox({
      items,
      index: safeIdx,
      contextTitle: context?.title,
      contextDate: context?.date,
    });
  };

  const handlePrevMedia = () => {
    setLightbox((prev) =>
      prev && prev.index > 0 ? { ...prev, index: prev.index - 1 } : prev
    );
  };

  const handleNextMedia = () => {
    setLightbox((prev) =>
      prev && prev.index < prev.items.length - 1
        ? { ...prev, index: prev.index + 1 }
        : prev
    );
  };

  // If locked for visitor, show LockScreen
  if (!isUnlocked) {
    return (
      <LockScreen
        partner1={config.partner1}
        partner2={config.partner2}
        subtitle={config.hero.lockScreenSubtitle}
        hint={config.hero.lockScreenHint}
        correctPin={config.secretPin}
        onUnlock={handleUnlockSite}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FAF7F5] text-stone-800 font-sans pb-20 sm:pb-0">
      <FloatingHearts
        enabled={config.appearance.showFloatingParticles}
        symbols={config.appearance.floatingSymbols}
      />

      {/* Navigation & Admin toolbar */}
      <Navbar
        partner1={config.partner1}
        partner2={config.partner2}
        daughterName={config.daughter.name}
        isAdminUnlocked={isAdminUnlocked}
        isLiveEditMode={isLiveEditMode}
        hasUnsavedGitHubChanges={hasUnsavedChanges}
        onLock={handleLockSite}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onTriggerAdminButton={handleTriggerAdminButton}
        onToggleLiveEdit={handleToggleLiveEdit}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <HeroSection
          partner1={config.partner1}
          partner2={config.partner2}
          startDate={config.relationshipStartDate}
          heroTexts={config.hero}
          daughter={config.daughter}
          isLiveEditMode={isLiveEditMode}
          onEditSection={() => handleOpenSectionInAdmin('portada')}
        />

        {/* Vaiolet Section */}
        <VaioletSection
          daughter={config.daughter}
          onUpdateDaughter={(updatedDaughter) =>
            handleUpdateConfig({ ...config, daughter: updatedDaughter })
          }
          onSelectMedia={handleSelectMedia}
          isLiveEditMode={isLiveEditMode}
          isAdminUnlocked={isAdminUnlocked}
          onEditSection={() => handleOpenSectionInAdmin('vaiolet')}
        />

        {/* Timeline of Memories */}
        <TimelineSection
          memories={config.memories}
          timelineConfig={config.timelineSection}
          onSelectMedia={handleSelectMedia}
          onToggleFavorite={handleToggleFavorite}
          isLiveEditMode={isLiveEditMode}
          onEditSection={() => handleOpenSectionInAdmin('recuerdos')}
          onEditMemory={(id) => handleOpenSectionInAdmin('recuerdos', id)}
          onDeleteMemory={handleDeleteMemory}
          onAddMemory={() => setIsAddModalOpen(true)}
        />

        {/* Secret Love Letters */}
        <LoveLettersSection
          letters={config.letters}
          lettersConfig={config.lettersSection}
          isLiveEditMode={isLiveEditMode}
          onEditSection={() => handleOpenSectionInAdmin('cartas')}
          onEditLetter={(id) => handleOpenSectionInAdmin('cartas', undefined, id)}
          onDeleteLetter={handleDeleteLetter}
          onAddLetter={() => handleOpenSectionInAdmin('cartas')}
        />
      </main>

      {/* Footer */}
      <Footer
        partner1={config.partner1}
        partner2={config.partner2}
        footerConfig={config.footer}
        isLiveEditMode={isLiveEditMode}
        onEditSection={() => handleOpenSectionInAdmin('diseno')}
      />

      {/* Fullscreen Lightbox Modal */}
      <MediaLightbox
        media={activeMedia}
        onClose={() => setLightbox(null)}
        onPrev={handlePrevMedia}
        onNext={handleNextMedia}
        hasPrev={Boolean(lightbox && lightbox.index > 0)}
        hasNext={Boolean(lightbox && lightbox.index < lightbox.items.length - 1)}
        currentIndex={lightbox?.index}
        totalCount={lightbox?.items.length}
        contextTitle={lightbox?.contextTitle}
        contextDate={lightbox?.contextDate}
      />

      {/* Add Memory Modal */}
      <AddMemoryModal
        isOpen={isAddModalOpen}
        categories={config.timelineSection.categories}
        onClose={() => setIsAddModalOpen(false)}
        onAddMemory={handleAddMemory}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        correctPassword={config.adminPassword}
        onSuccess={handleAdminLoginSuccess}
        onClose={() => setIsAdminLoginOpen(false)}
      />

      {/* Comprehensive 100% Admin Dashboard */}
      {isAdminDashboardOpen && (
        <AdminDashboard
          key={`${adminTab}-${focusMemoryId || ''}-${focusLetterId || ''}`}
          isOpen={isAdminDashboardOpen}
          config={config}
          initialTab={adminTab}
          focusMemoryId={focusMemoryId}
          focusLetterId={focusLetterId}
          hasUnsavedGitHubChanges={hasUnsavedChanges}
          onUpdateConfig={handleUpdateConfig}
          onResetToDefaults={handleResetToDefaults}
          onClose={() => setIsAdminDashboardOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
