export type MediaItem = {
  type: 'image' | 'video';
  url: string;
  caption?: string;
};

export type MemoryCategory = 
  | 'inicio' 
  | 'viaje' 
  | 'hito' 
  | 'embarazo' 
  | 'vaiolet' 
  | 'cita' 
  | 'especial';

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

export type DaughterInfo = {
  name: string;
  status: 'expecting' | 'born';
  // If expecting:
  gestationWeeksAtRefDate: number; // e.g. 39
  refDate: string; // e.g. '2026-10-17'
  estimatedDueDate: string; // e.g. '2026-10-24'
  ultrasoundImages?: MediaItem[];
  pregnancyNote?: string;
  // If born:
  birthDate?: string; // ISO string e.g. '2026-10-20T14:30:00'
  birthWeight?: string; // e.g. '3.2 kg'
  birthLength?: string; // e.g. '49 cm'
  birthCity?: string;
  birthNote?: string;
};

export type LoveLetter = {
  id: string;
  title: string;
  author: 'Maicol' | 'Vanessa' | 'Ambos';
  recipient: 'Vanessa' | 'Maicol' | 'Vaiolet' | 'Nosotros';
  sealColor?: string;
  openWhen: string; // e.g. "Ábreme cuando me extrañes mucho"
  content: string;
  dateWritten: string;
};

export type RelationshipConfig = {
  partner1: string; // "Maicol"
  partner2: string; // "Vanessa"
  relationshipStartDate: string; // ISO string '2025-07-11T00:00:00'
  secretPin: string; // "1107"
  daughter: DaughterInfo;
  memories: Memory[];
  letters: LoveLetter[];
};
