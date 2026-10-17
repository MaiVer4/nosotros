import React, { useState, useMemo } from 'react';
import { initialRelationshipConfig } from './data/relationshipData';
import type { DaughterInfo, Memory, MediaItem } from './types';
import { LockScreen } from './components/LockScreen';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { VaioletSection } from './components/VaioletSection';
import { TimelineSection } from './components/TimelineSection';
import { LoveLettersSection } from './components/LoveLettersSection';
import { MediaLightbox } from './components/MediaLightbox';
import { AddMemoryModal } from './components/AddMemoryModal';
import { FloatingHearts } from './components/FloatingHearts';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  // Session unlock state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('nosotros_unlocked') === 'true';
  });

  // Daughter info state
  const [daughter, setDaughter] = useState<DaughterInfo>(() => {
    const saved = localStorage.getItem('nosotros_daughter');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved daughter data:', e);
      }
    }
    return initialRelationshipConfig.daughter;
  });

  // Memories list (base + saved custom memories)
  const [memories, setMemories] = useState<Memory[]>(() => {
    const saved = localStorage.getItem('nosotros_memories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved memories:', e);
      }
    }
    return initialRelationshipConfig.memories;
  });

  // Lightbox state
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);

  // Flattened media array for lightbox navigation
  const allMediaList = useMemo<MediaItem[]>(() => {
    const list: MediaItem[] = [];
    // Daughter ultrasound images
    if (daughter.ultrasoundImages) {
      list.push(...daughter.ultrasoundImages);
    }
    // Memories media
    memories.forEach((mem) => {
      list.push(...mem.media);
    });
    return list;
  }, [daughter, memories]);

  const activeMedia = activeMediaIndex !== null ? allMediaList[activeMediaIndex] : null;

  // Add memory modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Handle Unlock
  const handleUnlock = () => {
    setIsUnlocked(true);
    localStorage.setItem('nosotros_unlocked', 'true');
  };

  // Handle Lock
  const handleLock = () => {
    setIsUnlocked(false);
    localStorage.removeItem('nosotros_unlocked');
  };

  // Handle Daughter info update
  const handleUpdateDaughter = (updated: DaughterInfo) => {
    setDaughter(updated);
    localStorage.setItem('nosotros_daughter', JSON.stringify(updated));
  };

  // Handle Add Memory
  const handleAddMemory = (newMemory: Memory) => {
    const updated = [newMemory, ...memories];
    setMemories(updated);
    localStorage.setItem('nosotros_memories', JSON.stringify(updated));
  };

  // Handle Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    const updated = memories.map((m) =>
      m.id === id ? { ...m, isFavorite: !m.isFavorite } : m
    );
    setMemories(updated);
    localStorage.setItem('nosotros_memories', JSON.stringify(updated));
  };

  // Handle Lightbox selection
  const handleSelectMedia = (selected: MediaItem) => {
    const index = allMediaList.findIndex((m) => m.url === selected.url);
    if (index !== -1) {
      setActiveMediaIndex(index);
    } else {
      setActiveMediaIndex(0);
    }
  };

  const handlePrevMedia = () => {
    if (activeMediaIndex !== null && activeMediaIndex > 0) {
      setActiveMediaIndex(activeMediaIndex - 1);
    }
  };

  const handleNextMedia = () => {
    if (activeMediaIndex !== null && activeMediaIndex < allMediaList.length - 1) {
      setActiveMediaIndex(activeMediaIndex + 1);
    }
  };

  // If locked, render LockScreen
  if (!isUnlocked) {
    return (
      <LockScreen
        correctPin={initialRelationshipConfig.secretPin}
        onUnlock={handleUnlock}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FAF7F5] text-stone-800 font-sans pb-20 sm:pb-0">
      <FloatingHearts />

      {/* Navigation */}
      <Navbar
        onLock={handleLock}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero & Realtime Relationship Counter */}
        <HeroSection
          partner1={initialRelationshipConfig.partner1}
          partner2={initialRelationshipConfig.partner2}
          startDate={initialRelationshipConfig.relationshipStartDate}
          daughterName={daughter.name}
        />

        {/* Dedicated Vaiolet Section (Expecting 39 Weeks / Born) */}
        <VaioletSection
          daughter={daughter}
          onUpdateDaughter={handleUpdateDaughter}
          onSelectMedia={handleSelectMedia}
        />

        {/* Timeline of Memories */}
        <TimelineSection
          memories={memories}
          onSelectMedia={handleSelectMedia}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Secret Love Letters "Ábreme cuando..." */}
        <LoveLettersSection letters={initialRelationshipConfig.letters} />
      </main>

      {/* Footer */}
      <Footer
        partner1={initialRelationshipConfig.partner1}
        partner2={initialRelationshipConfig.partner2}
        daughterName={daughter.name}
        startDate={initialRelationshipConfig.relationshipStartDate}
      />

      {/* Fullscreen Lightbox Modal */}
      <MediaLightbox
        media={activeMedia}
        onClose={() => setActiveMediaIndex(null)}
        onPrev={handlePrevMedia}
        onNext={handleNextMedia}
        hasPrev={activeMediaIndex !== null && activeMediaIndex > 0}
        hasNext={activeMediaIndex !== null && activeMediaIndex < allMediaList.length - 1}
      />

      {/* Add Memory Modal */}
      <AddMemoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMemory={handleAddMemory}
      />
    </div>
  );
};

export default App;
