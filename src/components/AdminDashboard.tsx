import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Home,
  Baby,
  Camera,
  Mail,
  Sparkles,
  Shield,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  CloudUpload,
  CheckCircle2,
  Download,
  Upload,
  RotateCcw,
  Star,
  Copy,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type {
  RelationshipConfig,
  AdminTabId,
  Memory,
  LoveLetter,
  ChecklistItem,
  CategoryItem,
  GitHubSyncConfig,
} from '../types';
import { MediaManagerEditor } from './MediaManagerEditor';
import {
  loadGitHubSyncConfig,
  saveGitHubSyncConfig,
  markChangesPublished,
} from '../utils/storageService';
import {
  verifyGitHubConnection,
  publishToGitHub,
  type SyncProgress,
} from '../utils/githubSync';

interface AdminDashboardProps {
  isOpen: boolean;
  config: RelationshipConfig;
  initialTab?: AdminTabId;
  focusMemoryId?: string | null;
  focusLetterId?: string | null;
  hasUnsavedGitHubChanges: boolean;
  onUpdateConfig: (updated: RelationshipConfig, markUnpublished?: boolean) => void;
  onResetToDefaults: () => void;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  config,
  initialTab = 'portada',
  focusMemoryId = null,
  focusLetterId = null,
  hasUnsavedGitHubChanges,
  onUpdateConfig,
  onResetToDefaults,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTabId>(initialTab);
  const [expandedMemoryId, setExpandedMemoryId] = useState<string | null>(
    focusMemoryId || config.memories[0]?.id || null
  );
  const [expandedLetterId, setExpandedLetterId] = useState<string | null>(
    focusLetterId || config.letters[0]?.id || null
  );
  const [memorySearch, setMemorySearch] = useState('');
  const [newCategoryLabel, setNewCategoryLabel] = useState('');

  // GitHub Sync states
  const [ghConfig, setGhConfig] = useState<GitHubSyncConfig>(() =>
    loadGitHubSyncConfig()
  );
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [isTestingGh, setIsTestingGh] = useState(false);

  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (focusMemoryId) {
      setActiveTab('recuerdos');
      setExpandedMemoryId(focusMemoryId);
    }
  }, [focusMemoryId]);

  useEffect(() => {
    if (focusLetterId) {
      setActiveTab('cartas');
      setExpandedLetterId(focusLetterId);
    }
  }, [focusLetterId]);

  if (!isOpen) return null;

  const tabs: Array<{ id: AdminTabId; label: string; icon: React.ReactNode }> = [
    { id: 'portada', label: 'Portada y Textos', icon: <Home className="w-4 h-4" /> },
    { id: 'vaiolet', label: 'Vaiolet 🌸', icon: <Baby className="w-4 h-4" /> },
    { id: 'recuerdos', label: 'Recuerdos y Fotos', icon: <Camera className="w-4 h-4" /> },
    { id: 'cartas', label: 'Cartas Secretas', icon: <Mail className="w-4 h-4" /> },
    { id: 'diseno', label: 'Pie y Efectos', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'seguridad', label: 'GitHub & Claves', icon: <Shield className="w-4 h-4" /> },
  ];

  // --- Handlers for Hero / Portada ---
  const updateHero = (patch: Partial<RelationshipConfig['hero']>) => {
    onUpdateConfig({
      ...config,
      hero: {
        ...config.hero,
        ...patch,
      },
    });
  };

  // --- Handlers for Daughter / Vaiolet ---
  const updateDaughter = (patch: Partial<RelationshipConfig['daughter']>) => {
    onUpdateConfig({
      ...config,
      daughter: {
        ...config.daughter,
        ...patch,
      },
    });
  };

  const handleAddChecklistItem = () => {
    const current = config.daughter.checklist || [];
    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      title: 'Nuevo preparativo listo',
      description: 'Descripción del preparativo para la llegada.',
    };
    updateDaughter({ checklist: [...current, newItem] });
  };

  const handleUpdateChecklistItem = (
    index: number,
    patch: Partial<ChecklistItem>
  ) => {
    const current = [...(config.daughter.checklist || [])];
    current[index] = { ...current[index], ...patch };
    updateDaughter({ checklist: current });
  };

  const handleDeleteChecklistItem = (index: number) => {
    const current = (config.daughter.checklist || []).filter((_, i) => i !== index);
    updateDaughter({ checklist: current });
  };

  // --- Handlers for Timeline & Memories ---
  const updateTimelineSection = (
    patch: Partial<RelationshipConfig['timelineSection']>
  ) => {
    onUpdateConfig({
      ...config,
      timelineSection: {
        ...config.timelineSection,
        ...patch,
      },
    });
  };

  const handleAddCategory = () => {
    const clean = newCategoryLabel.trim();
    if (!clean) return;
    const id = clean
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-');

    const exists = config.timelineSection.categories.some((c) => c.id === id);
    if (exists) return;

    const updated: CategoryItem[] = [
      ...config.timelineSection.categories,
      { id, label: clean },
    ];
    updateTimelineSection({ categories: updated });
    setNewCategoryLabel('');
  };

  const handleDeleteCategory = (catId: string) => {
    if (catId === 'todos' || catId === 'favoritos') return;
    const updated = config.timelineSection.categories.filter((c) => c.id !== catId);
    updateTimelineSection({ categories: updated });
  };

  const handleAddMemory = () => {
    const newMem: Memory = {
      id: `mem-${Date.now()}`,
      title: 'Nuevo recuerdo inolvidable',
      date: new Date().toISOString().slice(0, 10),
      category: 'especial',
      location: 'Nuestro lugar especial',
      description: 'Escribe aquí la historia de este hermoso momento...',
      isFavorite: false,
      tags: ['Amor', 'Familia'],
      media: [],
    };
    onUpdateConfig({
      ...config,
      memories: [newMem, ...config.memories],
    });
    setExpandedMemoryId(newMem.id);
  };

  const handleUpdateMemory = (id: string, patch: Partial<Memory>) => {
    const updated = config.memories.map((m) =>
      m.id === id ? { ...m, ...patch } : m
    );
    onUpdateConfig({
      ...config,
      memories: updated,
    });
  };

  const handleDuplicateMemory = (mem: Memory) => {
    const copy: Memory = {
      ...structuredClone(mem),
      id: `mem-${Date.now()}`,
      title: `${mem.title} (Copia)`,
    };
    onUpdateConfig({
      ...config,
      memories: [copy, ...config.memories],
    });
    setExpandedMemoryId(copy.id);
  };

  const handleDeleteMemory = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este recuerdo?')) return;
    const updated = config.memories.filter((m) => m.id !== id);
    onUpdateConfig({
      ...config,
      memories: updated,
    });
    if (expandedMemoryId === id) {
      setExpandedMemoryId(updated[0]?.id || null);
    }
  };

  // --- Handlers for Love Letters ---
  const updateLettersSection = (
    patch: Partial<RelationshipConfig['lettersSection']>
  ) => {
    onUpdateConfig({
      ...config,
      lettersSection: {
        ...config.lettersSection,
        ...patch,
      },
    });
  };

  const handleAddLetter = () => {
    const newLet: LoveLetter = {
      id: `let-${Date.now()}`,
      title: 'Nueva carta desde el corazón',
      author: config.partner1,
      recipient: config.partner2,
      openWhen: 'Ábreme cuando quieras recordar cuánto te amo',
      dateWritten: new Date().toISOString().slice(0, 10),
      sealColor: '#f43f68',
      content: 'Escribe aquí las palabras que quieres dejar guardadas para siempre...',
    };
    onUpdateConfig({
      ...config,
      letters: [...config.letters, newLet],
    });
    setExpandedLetterId(newLet.id);
  };

  const handleUpdateLetter = (id: string, patch: Partial<LoveLetter>) => {
    const updated = config.letters.map((l) =>
      l.id === id ? { ...l, ...patch } : l
    );
    onUpdateConfig({
      ...config,
      letters: updated,
    });
  };

  const handleDeleteLetter = (id: string) => {
    if (!confirm('¿Eliminar esta carta secreta?')) return;
    const updated = config.letters.filter((l) => l.id !== id);
    onUpdateConfig({
      ...config,
      letters: updated,
    });
    if (expandedLetterId === id) {
      setExpandedLetterId(updated[0]?.id || null);
    }
  };

  // --- Handlers for GitHub Sync & Backups ---
  const handleGhFieldChange = (patch: Partial<GitHubSyncConfig>) => {
    const next = { ...ghConfig, ...patch };
    setGhConfig(next);
    saveGitHubSyncConfig(next);
    setSyncError(null);
    setSyncSuccess(null);
  };

  const handleTestGitHub = async () => {
    setIsTestingGh(true);
    setSyncError(null);
    setSyncSuccess(null);
    try {
      const info = await verifyGitHubConnection(ghConfig);
      setSyncSuccess(
        `¡Conexión exitosa con ${info.fullName}! Rama principal: ${info.defaultBranch}.`
      );
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Error de conexión.');
    } finally {
      setIsTestingGh(false);
    }
  };

  const handlePublishToGitHub = async () => {
    setSyncError(null);
    setSyncSuccess(null);
    try {
      const updatedAfterUpload = await publishToGitHub(
        config,
        ghConfig,
        (prog) => setSyncProgress(prog)
      );
      onUpdateConfig(updatedAfterUpload, false);
      markChangesPublished();
      setSyncProgress(null);
      setSyncSuccess(
        '¡Todos los cambios y fotos se han guardado en tu repositorio de GitHub! En ~1 minuto estarán actualizados en GitHub Pages.'
      );
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f68', '#10b981', '#fb718d'],
      });
    } catch (err) {
      setSyncProgress(null);
      setSyncError(
        err instanceof Error ? err.message : 'Error al publicar en GitHub.'
      );
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `respaldo-nosotros-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        onUpdateConfig(parsed, true);
        alert('¡Copia de seguridad restaurada con éxito!');
      } catch {
        alert('El archivo seleccionado no es un JSON válido.');
      }
    };
    reader.readAsText(file);
    if (importFileInputRef.current) importFileInputRef.current.value = '';
  };

  const filteredMemories = config.memories.filter((m) => {
    if (!memorySearch.trim()) return true;
    const q = memorySearch.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.location?.toLowerCase().includes(q)
    );
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="relative w-full max-w-5xl h-[94dvh] sm:h-[88dvh] bg-[#FAF7F5] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-rose-200 flex flex-col overflow-hidden"
        >
          {/* Top Bar */}
          <div className="px-4 sm:px-6 py-3.5 bg-white border-b border-rose-100 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-base sm:text-xl font-bold text-stone-800 leading-tight">
                  Panel de Administración Total
                </h2>
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Los cambios se aplican y guardan en vivo automáticamente</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {ghConfig.token && (
                <button
                  type="button"
                  disabled={Boolean(syncProgress)}
                  onClick={handlePublishToGitHub}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold shadow-sm transition-all ${
                    hasUnsavedGitHubChanges
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                      : 'bg-stone-800 hover:bg-stone-900 text-white'
                  }`}
                >
                  <CloudUpload className="w-4 h-4" />
                  <span className="hidden sm:inline">Publicar en GitHub</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-semibold transition-colors"
              >
                <span>Ver Página</span>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-3 sm:px-6 py-2 bg-white/80 border-b border-stone-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Sync Progress Banner if currently uploading to GitHub */}
          {syncProgress && (
            <div className="px-6 py-3 bg-rose-600 text-white text-xs font-medium flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{syncProgress.step}</span>
              </div>
              <span className="font-bold">{syncProgress.percentage}%</span>
            </div>
          )}

          {/* Main Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* TAB 1: PORTADA Y TEXTOS */}
            {activeTab === 'portada' && (
              <div className="space-y-6 max-w-3xl mx-auto">
                {/* Nombres y Fecha Principal */}
                <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold text-stone-800 border-b border-stone-100 pb-2">
                    1. Nombres de la Pareja y Fecha de Inicio
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                        Nombre 1
                      </label>
                      <input
                        type="text"
                        value={config.partner1}
                        onChange={(e) =>
                          onUpdateConfig({ ...config, partner1: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                        Nombre 2
                      </label>
                      <input
                        type="text"
                        value={config.partner2}
                        onChange={(e) =>
                          onUpdateConfig({ ...config, partner2: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                        Inicio de la Relación
                      </label>
                      <input
                        type="datetime-local"
                        value={config.relationshipStartDate.slice(0, 16)}
                        onChange={(e) =>
                          onUpdateConfig({
                            ...config,
                            relationshipStartDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                      Frase Romántica Principal (debajo de los nombres)
                    </label>
                    <textarea
                      rows={2}
                      value={config.hero.heroQuote}
                      onChange={(e) => updateHero({ heroQuote: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Textos del Contador y Tarjetas Rápidas */}
                <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold text-stone-800 border-b border-stone-100 pb-2">
                    2. Textos del Contador en Vivo y Tarjetas de Acceso Rápido
                  </h3>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                      Título de la caja del Contador
                    </label>
                    <input
                      type="text"
                      value={config.hero.counterTitle}
                      onChange={(e) => updateHero({ counterTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                        Texto antes de los días totales
                      </label>
                      <input
                        type="text"
                        value={config.hero.counterSubtextPrefix}
                        onChange={(e) =>
                          updateHero({ counterSubtextPrefix: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                        Texto después de los días totales
                      </label>
                      <input
                        type="text"
                        value={config.hero.counterSubtextSuffix}
                        onChange={(e) =>
                          updateHero({ counterSubtextSuffix: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-rose-600 block">
                        Tarjeta Izquierda (Aniversario)
                      </span>
                      <input
                        type="text"
                        placeholder="Título tarjeta aniversario"
                        value={config.hero.anniversaryCardTitle}
                        onChange={(e) =>
                          updateHero({ anniversaryCardTitle: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Subtítulo tarjeta aniversario"
                        value={config.hero.anniversaryCardSubtitle}
                        onChange={(e) =>
                          updateHero({ anniversaryCardSubtitle: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold text-rose-600 block">
                        Tarjeta Derecha (Acceso a Vaiolet)
                      </span>
                      <input
                        type="text"
                        placeholder="Etiqueta superior"
                        value={config.hero.daughterCardBadge}
                        onChange={(e) =>
                          updateHero({ daughterCardBadge: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Texto principal"
                        value={config.hero.daughterCardTitle}
                        onChange={(e) =>
                          updateHero({ daughterCardTitle: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Subtítulo inferior"
                        value={config.hero.daughterCardSubtitle}
                        onChange={(e) =>
                          updateHero({ daughterCardSubtitle: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Pantalla de Bloqueo */}
                <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold text-stone-800 border-b border-stone-100 pb-2">
                    3. Textos de la Pantalla de Bloqueo (PIN)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                        Subtítulo bajo los nombres
                      </label>
                      <input
                        type="text"
                        value={config.hero.lockScreenSubtitle}
                        onChange={(e) =>
                          updateHero({ lockScreenSubtitle: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                        Texto de la pista del PIN
                      </label>
                      <input
                        type="text"
                        value={config.hero.lockScreenHint}
                        onChange={(e) =>
                          updateHero({ lockScreenHint: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SECCIÓN VAIOLET */}
            {activeTab === 'vaiolet' && (
              <div className="space-y-6 max-w-3xl mx-auto">
                {/* Cabecera y Estado de Vaiolet */}
                <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <h3 className="font-serif text-lg font-bold text-stone-800">
                      1. Datos Principales y Estado de {config.daughter.name}
                    </h3>

                    <div className="flex items-center p-1 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => updateDaughter({ status: 'expecting' })}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          config.daughter.status === 'expecting'
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'text-rose-700'
                        }`}
                      >
                        🤰 Dulce Espera
                      </button>
                      <button
                        type="button"
                        onClick={() => updateDaughter({ status: 'born' })}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          config.daughter.status === 'born'
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'text-rose-700'
                        }`}
                      >
                        👶 ¡Ya Nació!
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                        Nombre de su Hija
                      </label>
                      <input
                        type="text"
                        value={config.daughter.name}
                        onChange={(e) => updateDaughter({ name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                        Insignia Superior de Sección
                      </label>
                      <input
                        type="text"
                        value={config.daughter.sectionBadge || ''}
                        onChange={(e) =>
                          updateDaughter({ sectionBadge: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                      Subtítulo de la Sección ({config.daughter.status === 'expecting' ? 'Modo Dulce Espera' : 'Modo Ya Nació'})
                    </label>
                    <input
                      type="text"
                      value={
                        config.daughter.status === 'expecting'
                          ? config.daughter.expectingSubtitle || ''
                          : config.daughter.bornSubtitle || ''
                      }
                      onChange={(e) =>
                        config.daughter.status === 'expecting'
                          ? updateDaughter({ expectingSubtitle: e.target.value })
                          : updateDaughter({ bornSubtitle: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                    />
                  </div>
                </div>

                {/* Configuración de Dulce Espera vs Ya Nació */}
                {config.daughter.status === 'expecting' ? (
                  <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-4">
                    <h3 className="font-serif text-lg font-bold text-stone-800 border-b border-stone-100 pb-2">
                      2. Detalles del Embarazo (Dulce Espera)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                          Etiqueta de Estado (ej. ✨ ESTADO ACTUAL: SEMANA 39)
                        </label>
                        <input
                          type="text"
                          value={config.daughter.statusBadgeText || ''}
                          onChange={(e) =>
                            updateDaughter({ statusBadgeText: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                          Título Principal de la Tarjeta
                        </label>
                        <input
                          type="text"
                          value={config.daughter.expectingHeadline || ''}
                          onChange={(e) =>
                            updateDaughter({ expectingHeadline: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                        Nota / Mensaje de la Dulce Espera
                      </label>
                      <textarea
                        rows={3}
                        value={config.daughter.pregnancyNote || ''}
                        onChange={(e) =>
                          updateDaughter({ pregnancyNote: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                          Fecha Probable (Texto Visible)
                        </label>
                        <input
                          type="text"
                          value={config.daughter.estimatedDueDateLabel || ''}
                          onChange={(e) =>
                            updateDaughter({
                              estimatedDueDateLabel: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                          Subtexto Fecha Probable
                        </label>
                        <input
                          type="text"
                          value={config.daughter.estimatedDueDateSubtext || ''}
                          onChange={(e) =>
                            updateDaughter({
                              estimatedDueDateSubtext: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                          Porcentaje Barra (0 - 100%)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={config.daughter.customProgressPercentage ?? 98}
                          onChange={(e) =>
                            updateDaughter({
                              customProgressPercentage: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                        />
                      </div>
                    </div>

                    {/* Checklist Editor */}
                    <div className="pt-4 border-t border-stone-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                          Tarjetas del Checklist de Preparativos
                        </span>
                        <button
                          type="button"
                          onClick={handleAddChecklistItem}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Añadir Tarjeta</span>
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {(config.daughter.checklist || []).map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5"
                          >
                            <div className="flex-1 space-y-1.5">
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) =>
                                  handleUpdateChecklistItem(idx, {
                                    title: e.target.value,
                                  })
                                }
                                placeholder="Título del preparativo"
                                className="w-full px-2.5 py-1 rounded-lg border border-stone-200 text-xs font-semibold bg-white"
                              />
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) =>
                                  handleUpdateChecklistItem(idx, {
                                    description: e.target.value,
                                  })
                                }
                                placeholder="Descripción corta"
                                className="w-full px-2.5 py-1 rounded-lg border border-stone-200 text-xs bg-white"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteChecklistItem(idx)}
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-4">
                    <h3 className="font-serif text-lg font-bold text-stone-800 border-b border-stone-100 pb-2">
                      2. Datos de Nacimiento de {config.daughter.name}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                          Insignia de Celebración
                        </label>
                        <input
                          type="text"
                          value={config.daughter.bornBadgeText || ''}
                          onChange={(e) =>
                            updateDaughter({ bornBadgeText: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                          Título de Bienvenida
                        </label>
                        <input
                          type="text"
                          value={config.daughter.bornHeadline || ''}
                          onChange={(e) =>
                            updateDaughter({ bornHeadline: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                          Fecha y Hora de Nacimiento
                        </label>
                        <input
                          type="datetime-local"
                          value={(
                            config.daughter.birthDate ||
                            new Date().toISOString()
                          ).slice(0, 16)}
                          onChange={(e) =>
                            updateDaughter({ birthDate: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                          Peso al Nacer
                        </label>
                        <input
                          type="text"
                          value={config.daughter.birthWeight || ''}
                          onChange={(e) =>
                            updateDaughter({ birthWeight: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                          Estatura / Talla
                        </label>
                        <input
                          type="text"
                          value={config.daughter.birthLength || ''}
                          onChange={(e) =>
                            updateDaughter({ birthLength: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                        Mensaje de Bienvenida
                      </label>
                      <textarea
                        rows={3}
                        value={config.daughter.birthNote || ''}
                        onChange={(e) =>
                          updateDaughter({ birthNote: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Galería de Fotos y Videos de Vaiolet */}
                <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                    <h3 className="font-serif text-lg font-bold text-stone-800">
                      3. Galería de Fotos y Videos de {config.daughter.name}
                    </h3>
                    <input
                      type="text"
                      value={config.daughter.galleryTitle || ''}
                      onChange={(e) =>
                        updateDaughter({ galleryTitle: e.target.value })
                      }
                      placeholder="Título de la galería"
                      className="px-3 py-1 rounded-lg border border-stone-200 text-xs"
                    />
                  </div>

                  <MediaManagerEditor
                    label={`Fotos y Videos de ${config.daughter.name}`}
                    items={config.daughter.ultrasoundImages || []}
                    onChange={(updatedMedia) =>
                      updateDaughter({ ultrasoundImages: updatedMedia })
                    }
                  />
                </div>
              </div>
            )}

            {/* TAB 3: RECUERDOS Y FOTOS */}
            {activeTab === 'recuerdos' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* Textos y Categorías de la Línea de Tiempo */}
                <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold text-stone-800 border-b border-stone-100 pb-2">
                    Cabecera y Categorías de la Línea del Tiempo
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-stone-400 mb-1">
                        Insignia Superior
                      </label>
                      <input
                        type="text"
                        value={config.timelineSection.sectionBadge}
                        onChange={(e) =>
                          updateTimelineSection({ sectionBadge: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-stone-400 mb-1">
                        Título Principal
                      </label>
                      <input
                        type="text"
                        value={config.timelineSection.sectionTitle}
                        onChange={(e) =>
                          updateTimelineSection({ sectionTitle: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-stone-400 mb-1">
                        Subtítulo
                      </label>
                      <input
                        type="text"
                        value={config.timelineSection.sectionSubtitle}
                        onChange={(e) =>
                          updateTimelineSection({
                            sectionSubtitle: e.target.value,
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>
                  </div>

                  {/* Categorías */}
                  <div className="pt-2 border-t border-stone-100">
                    <label className="block text-[10px] font-semibold uppercase text-stone-400 mb-2">
                      Categorías / Filtros de Recuerdos
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                      {config.timelineSection.categories.map((cat) => (
                        <div
                          key={cat.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs text-rose-700"
                        >
                          <span>{cat.label}</span>
                          {cat.id !== 'todos' && cat.id !== 'favoritos' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="text-rose-400 hover:text-red-600"
                              title="Eliminar categoría"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 max-w-xs">
                      <input
                        type="text"
                        placeholder="Nueva categoría (ej. Cumpleaños)"
                        value={newCategoryLabel}
                        onChange={(e) => setNewCategoryLabel(e.target.value)}
                        className="flex-1 px-3 py-1 rounded-xl border border-stone-200 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="px-3 py-1 rounded-xl bg-stone-800 text-white text-xs font-semibold"
                      >
                        + Añadir
                      </button>
                    </div>
                  </div>
                </div>

                {/* Barra de acciones de Recuerdos */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="🔍 Buscar recuerdo para editar..."
                    value={memorySearch}
                    onChange={(e) => setMemorySearch(e.target.value)}
                    className="px-4 py-2 rounded-full border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />

                  <button
                    type="button"
                    onClick={handleAddMemory}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-semibold shadow-md transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Nuevo Recuerdo</span>
                  </button>
                </div>

                {/* Lista de Recuerdos Editables */}
                <div className="space-y-3">
                  {filteredMemories.map((mem) => {
                    const isExpanded = expandedMemoryId === mem.id;
                    const thumb = mem.media[0]?.url;

                    return (
                      <div
                        key={mem.id}
                        className={`rounded-2xl bg-white border transition-all overflow-hidden ${
                          isExpanded
                            ? 'border-rose-400 shadow-md'
                            : 'border-stone-200/90 hover:border-rose-200'
                        }`}
                      >
                        {/* Accordion Header */}
                        <div
                          onClick={() =>
                            setExpandedMemoryId(isExpanded ? null : mem.id)
                          }
                          className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-rose-50/30"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={mem.title}
                                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200 bg-stone-100"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400 shrink-0">
                                <Camera className="w-5 h-5" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-rose-600">
                                  {mem.date}
                                </span>
                                <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold">
                                  {mem.category}
                                </span>
                                {mem.isFavorite && (
                                  <span className="text-xs" title="Favorito">
                                    ⭐
                                  </span>
                                )}
                              </div>
                              <h4 className="font-serif text-sm sm:text-base font-bold text-stone-800 truncate">
                                {mem.title}
                              </h4>
                              <p className="text-[11px] text-stone-400">
                                {mem.media.length}{' '}
                                {mem.media.length === 1
                                  ? 'archivo multimedia'
                                  : 'archivos multimedia'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateMemory(mem);
                              }}
                              title="Duplicar recuerdo"
                              className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMemory(mem.id);
                              }}
                              title="Eliminar recuerdo"
                              className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="p-1.5 text-stone-400">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Editor Body */}
                        {isExpanded && (
                          <div className="p-4 sm:p-5 border-t border-rose-100 bg-rose-50/15 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                                  Título del Recuerdo
                                </label>
                                <input
                                  type="text"
                                  value={mem.title}
                                  onChange={(e) =>
                                    handleUpdateMemory(mem.id, {
                                      title: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                                  Fecha
                                </label>
                                <input
                                  type="date"
                                  value={mem.date}
                                  onChange={(e) =>
                                    handleUpdateMemory(mem.id, {
                                      date: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                                  Categoría
                                </label>
                                <select
                                  value={mem.category}
                                  onChange={(e) =>
                                    handleUpdateMemory(mem.id, {
                                      category: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
                                >
                                  {config.timelineSection.categories
                                    .filter(
                                      (c) =>
                                        c.id !== 'todos' && c.id !== 'favoritos'
                                    )
                                    .map((c) => (
                                      <option key={c.id} value={c.id}>
                                        {c.label}
                                      </option>
                                    ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                                  Ubicación / Lugar
                                </label>
                                <input
                                  type="text"
                                  value={mem.location || ''}
                                  onChange={(e) =>
                                    handleUpdateMemory(mem.id, {
                                      location: e.target.value,
                                    })
                                  }
                                  placeholder="ej. En casa, Playa..."
                                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                                  Etiquetas (separadas por coma)
                                </label>
                                <input
                                  type="text"
                                  value={(mem.tags || []).join(', ')}
                                  onChange={(e) =>
                                    handleUpdateMemory(mem.id, {
                                      tags: e.target.value
                                        .split(',')
                                        .map((t) => t.trim())
                                        .filter(Boolean),
                                    })
                                  }
                                  placeholder="Amor, Viaje, Risa"
                                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[10px] font-semibold uppercase text-stone-500">
                                  Historia / Descripción Completa
                                </label>
                                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(mem.isFavorite)}
                                    onChange={(e) =>
                                      handleUpdateMemory(mem.id, {
                                        isFavorite: e.target.checked,
                                      })
                                    }
                                    className="rounded text-rose-500"
                                  />
                                  <Star className="w-3.5 h-3.5 fill-rose-500" />
                                  <span>Destacar en Favoritos</span>
                                </label>
                              </div>
                              <textarea
                                rows={3}
                                value={mem.description}
                                onChange={(e) =>
                                  handleUpdateMemory(mem.id, {
                                    description: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
                              />
                            </div>

                            {/* Media Manager for this Memory */}
                            <div className="pt-3 border-t border-rose-100">
                              <MediaManagerEditor
                                label="Fotos y Videos de este Recuerdo"
                                items={mem.media}
                                onChange={(updatedMedia) =>
                                  handleUpdateMemory(mem.id, {
                                    media: updatedMedia,
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: CARTAS SECRETAS */}
            {activeTab === 'cartas' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                    <h3 className="font-serif text-lg font-bold text-stone-800">
                      Cabecera de la Sección de Cartas
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddLetter}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nueva Carta Secreta</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-stone-400 mb-1">
                        Insignia Superior
                      </label>
                      <input
                        type="text"
                        value={config.lettersSection.sectionBadge}
                        onChange={(e) =>
                          updateLettersSection({ sectionBadge: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-stone-400 mb-1">
                        Título Principal
                      </label>
                      <input
                        type="text"
                        value={config.lettersSection.sectionTitle}
                        onChange={(e) =>
                          updateLettersSection({ sectionTitle: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-stone-400 mb-1">
                        Subtítulo
                      </label>
                      <input
                        type="text"
                        value={config.lettersSection.sectionSubtitle}
                        onChange={(e) =>
                          updateLettersSection({
                            sectionSubtitle: e.target.value,
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Lista de Cartas */}
                <div className="space-y-3">
                  {config.letters.map((letter) => {
                    const isExpanded = expandedLetterId === letter.id;
                    return (
                      <div
                        key={letter.id}
                        className={`rounded-2xl bg-white border transition-all overflow-hidden ${
                          isExpanded
                            ? 'border-rose-400 shadow-md'
                            : 'border-stone-200/90'
                        }`}
                      >
                        <div
                          onClick={() =>
                            setExpandedLetterId(isExpanded ? null : letter.id)
                          }
                          className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-rose-50/30"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
                              style={{
                                backgroundColor: letter.sealColor || '#f43f68',
                              }}
                            >
                              <Mail className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase text-rose-500 block">
                                De: {letter.author} • Para: {letter.recipient}
                              </span>
                              <h4 className="font-serif text-sm sm:text-base font-bold text-stone-800 truncate">
                                {letter.title}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLetter(letter.id);
                              }}
                              className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-stone-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-stone-400" />
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 sm:p-5 border-t border-rose-100 bg-rose-50/15 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                                  Título del Sobre
                                </label>
                                <input
                                  type="text"
                                  value={letter.title}
                                  onChange={(e) =>
                                    handleUpdateLetter(letter.id, {
                                      title: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                                  Condición ("Ábreme cuando...")
                                </label>
                                <input
                                  type="text"
                                  value={letter.openWhen}
                                  onChange={(e) =>
                                    handleUpdateLetter(letter.id, {
                                      openWhen: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                                  De (Autor)
                                </label>
                                <input
                                  type="text"
                                  value={letter.author}
                                  onChange={(e) =>
                                    handleUpdateLetter(letter.id, {
                                      author: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                                  Para (Destinatario)
                                </label>
                                <input
                                  type="text"
                                  value={letter.recipient}
                                  onChange={(e) =>
                                    handleUpdateLetter(letter.id, {
                                      recipient: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                                  Fecha Escrita
                                </label>
                                <input
                                  type="date"
                                  value={letter.dateWritten}
                                  onChange={(e) =>
                                    handleUpdateLetter(letter.id, {
                                      dateWritten: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                                  Color del Sello
                                </label>
                                <input
                                  type="color"
                                  value={letter.sealColor || '#f43f68'}
                                  onChange={(e) =>
                                    handleUpdateLetter(letter.id, {
                                      sealColor: e.target.value,
                                    })
                                  }
                                  className="w-full h-9 rounded-xl border border-stone-200 bg-white cursor-pointer p-1"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                                Contenido Completo de la Carta
                              </label>
                              <textarea
                                rows={7}
                                value={letter.content}
                                onChange={(e) =>
                                  handleUpdateLetter(letter.id, {
                                    content: e.target.value,
                                  })
                                }
                                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm bg-white font-serif leading-relaxed"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: PIE DE PÁGINA Y EFECTOS */}
            {activeTab === 'diseno' && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold text-stone-800 border-b border-stone-100 pb-2">
                    1. Textos del Pie de Página (Footer)
                  </h3>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                      Frase Destacada del Pie de Página
                    </label>
                    <input
                      type="text"
                      value={config.footer.quote}
                      onChange={(e) =>
                        onUpdateConfig({
                          ...config,
                          footer: { ...config.footer, quote: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                      Párrafo Descriptivo
                    </label>
                    <textarea
                      rows={2}
                      value={config.footer.description}
                      onChange={(e) =>
                        onUpdateConfig({
                          ...config,
                          footer: {
                            ...config.footer,
                            description: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                      Texto de la Insignia Inferior
                    </label>
                    <input
                      type="text"
                      value={config.footer.badgeText}
                      onChange={(e) =>
                        onUpdateConfig({
                          ...config,
                          footer: {
                            ...config.footer,
                            badgeText: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold text-stone-800 border-b border-stone-100 pb-2">
                    2. Partículas y Efectos Ambientales
                  </h3>
                  <label className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 border border-rose-100 cursor-pointer">
                    <div>
                      <span className="text-sm font-semibold text-stone-800 block">
                        Mostrar partículas flotantes en el fondo
                      </span>
                      <span className="text-xs text-stone-500">
                        Corazones, flores y destellos suaves acelerados por GPU
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.appearance.showFloatingParticles}
                      onChange={(e) =>
                        onUpdateConfig({
                          ...config,
                          appearance: {
                            ...config.appearance,
                            showFloatingParticles: e.target.checked,
                          },
                        })
                      }
                      className="w-5 h-5 rounded text-rose-500"
                    />
                  </label>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                      Emojis Flotantes (separados por coma)
                    </label>
                    <input
                      type="text"
                      value={config.appearance.floatingSymbols.join(', ')}
                      onChange={(e) =>
                        onUpdateConfig({
                          ...config,
                          appearance: {
                            ...config.appearance,
                            floatingSymbols: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: SEGURIDAD, CLAVES Y GITHUB SYNC */}
            {activeTab === 'seguridad' && (
              <div className="space-y-6 max-w-3xl mx-auto">
                {/* Conexión con GitHub Pages */}
                <div className="p-5 rounded-2xl bg-white border-2 border-rose-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-stone-800 flex items-center gap-2">
                        <CloudUpload className="w-5 h-5 text-rose-500" />
                        <span>Sincronización Directa con tu GitHub</span>
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Publica todas las fotos subidas y los cambios de texto directamente en tu repositorio de GitHub con un solo clic.
                      </p>
                    </div>
                  </div>

                  {syncSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                      ✅ {syncSuccess}
                    </div>
                  )}

                  {syncError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                      ⚠️ {syncError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                        Usuario de GitHub (Owner)
                      </label>
                      <input
                        type="text"
                        placeholder="ej. maicol-dev"
                        value={ghConfig.owner}
                        onChange={(e) =>
                          handleGhFieldChange({ owner: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                        Nombre del Repositorio
                      </label>
                      <input
                        type="text"
                        placeholder="ej. nosotros"
                        value={ghConfig.repo}
                        onChange={(e) =>
                          handleGhFieldChange({ repo: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                        Rama (Branch)
                      </label>
                      <input
                        type="text"
                        placeholder="main"
                        value={ghConfig.branch}
                        onChange={(e) =>
                          handleGhFieldChange({ branch: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-semibold uppercase text-stone-500">
                        GitHub Personal Access Token (con permiso `repo` o `Contents: Read & Write`)
                      </label>
                      <a
                        href="https://github.com/settings/tokens/new?scopes=repo&description=Album+Nosotros+Admin"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline"
                      >
                        <span>Crear Token en GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <input
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      value={ghConfig.token}
                      onChange={(e) =>
                        handleGhFieldChange({ token: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-mono"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isTestingGh}
                      onClick={handleTestGitHub}
                      className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-all"
                    >
                      {isTestingGh ? 'Probando...' : '🔍 Probar Conexión'}
                    </button>

                    <button
                      type="button"
                      disabled={Boolean(syncProgress)}
                      onClick={handlePublishToGitHub}
                      className="flex-1 py-2.5 px-5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <CloudUpload className="w-4 h-4" />
                      <span>🚀 Guardar y Publicar Todo en GitHub Ahora</span>
                    </button>
                  </div>
                </div>

                {/* Claves de Acceso */}
                <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold text-stone-800 border-b border-stone-100 pb-2">
                    Claves de Seguridad
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                        PIN de Entrada a la Web (4 dígitos)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={config.secretPin}
                        onChange={(e) =>
                          onUpdateConfig({
                            ...config,
                            secretPin: e.target.value.replace(/\D/g, '').slice(0, 4),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                        Clave de Administrador (Para este Panel)
                      </label>
                      <input
                        type="text"
                        value={config.adminPassword}
                        onChange={(e) =>
                          onUpdateConfig({
                            ...config,
                            adminPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Respaldo Local (Exportar / Importar / Reset) */}
                <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold text-stone-800 border-b border-stone-100 pb-2">
                    Copia de Seguridad y Restauración
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleExportJson}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar Respaldo (.json)</span>
                    </button>

                    <input
                      ref={importFileInputRef}
                      type="file"
                      accept="application/json"
                      onChange={handleImportJson}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => importFileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Restaurar desde Archivo (.json)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            '¿Seguro que deseas restaurar los textos y fotos de ejemplo originales? Se borrarán los cambios no exportados.'
                          )
                        ) {
                          onResetToDefaults();
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors ml-auto"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Restaurar Originales</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
