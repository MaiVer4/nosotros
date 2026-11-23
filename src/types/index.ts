export type MediaItem = {
  id?: string;
  type: 'image' | 'video';
  url: string;
  thumbUrl?: string;
  caption?: string;
};

export type MemoryCategory = string;

export type Memory = {
  id: string;
  title: string;
  date: string; // ISO date format YYYY-MM-DD
  category: MemoryCategory;
  description: string;
  media: MediaItem[];
  location?: string;
  tags?: string[];
  isFavorite?: boolean;
};

export type ChecklistItem = {
  id: string;
  title: string;
  description: string;
};

export type BabyMilestone = {
  id: string;
  monthNumber?: number;
  title: string;
  date?: string; // YYYY-MM-DD
  achieved: boolean;
  weight?: string;
  height?: string;
  note: string;
  icon?: string;
  mediaUrl?: string;
};

export type CategoryItem = {
  id: string;
  label: string;
};

export type HeroTexts = {
  lockScreenSubtitle: string;
  lockScreenHint: string;
  heroQuote: string;
  counterTitle: string;
  counterSubtextPrefix: string;
  counterSubtextSuffix: string;
  anniversaryCardTitle: string;
  anniversaryCardSubtitle: string;
  daughterCardBadge: string;
  daughterCardTitle: string;
  daughterCardSubtitle: string;
  daughterBornCardBadge?: string;
  daughterBornCardSubtitle?: string;
};

export type DaughterInfo = {
  name: string;
  status: 'expecting' | 'born';
  sectionBadge?: string;
  expectingSubtitle?: string;
  bornSubtitle?: string;
  // If expecting:
  statusBadgeText?: string;
  expectingHeadline?: string;
  gestationWeeksAtRefDate: number; // e.g. 39
  refDate: string; // e.g. '2026-10-17'
  estimatedDueDate: string; // e.g. '2026-10-24'
  estimatedDueDateLabel?: string;
  estimatedDueDateSubtext?: string;
  customProgressPercentage?: number;
  ultrasoundImages: MediaItem[];
  galleryTitle?: string;
  pregnancyNote?: string;
  checklist?: ChecklistItem[];
  // If born:
  bornBadgeText?: string;
  bornHeadline?: string;
  birthDate?: string | null; // ISO string e.g. '2026-10-24T12:00:00'
  birthWeight?: string; // e.g. '3.25 kg'
  birthLength?: string; // e.g. '49 cm'
  birthCity?: string;
  birthNote?: string;
  bornImages?: MediaItem[];
  bornGalleryTitle?: string;
  milestones?: BabyMilestone[];
};

export type LoveLetter = {
  id: string;
  title: string;
  author: string;
  recipient: string;
  sealColor?: string;
  openWhen: string; // e.g. "Ábreme cuando me extrañes mucho"
  content: string;
  dateWritten: string;
};

export type TimelineSectionConfig = {
  sectionBadge: string;
  sectionTitle: string;
  sectionSubtitle: string;
  categories: CategoryItem[];
};

export type LettersSectionConfig = {
  sectionBadge: string;
  sectionTitle: string;
  sectionSubtitle: string;
};

export type FooterConfig = {
  quote: string;
  description: string;
  badgeText: string;
};

export type AppearanceConfig = {
  showFloatingParticles: boolean;
  floatingSymbols: string[];
};

export type GitHubSyncConfig = {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  sessionOnly?: boolean;
};

export type RelationshipConfig = {
  partner1: string; // "Maicol"
  partner2: string; // "Vanessa"
  relationshipStartDate: string; // ISO string '2025-07-11T00:00:00'
  secretPin: string; // Hashed 'sha256:...' or legacy plain
  adminPassword: string; // Hashed 'sha256:...' or legacy plain
  hero: HeroTexts;
  daughter: DaughterInfo;
  timelineSection: TimelineSectionConfig;
  memories: Memory[];
  lettersSection: LettersSectionConfig;
  letters: LoveLetter[];
  footer: FooterConfig;
  appearance: AppearanceConfig;
};

export type AdminTabId =
  | 'portada'
  | 'vaiolet'
  | 'recuerdos'
  | 'cartas'
  | 'diseno'
  | 'seguridad';
