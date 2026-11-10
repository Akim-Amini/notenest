export type NoteType = 'note' | 'list';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type PastelColor =
  | 'peach'
  | 'amber'
  | 'lavender'
  | 'mint'
  | 'rose'
  | 'sky'
  | 'buttercup'
  | 'slate';

export interface NoteItem {
  id: string;
  type: NoteType;
  title: string;
  content: string; // for 'note'
  checklist: ChecklistItem[]; // for 'list'
  color: PastelColor;
  isPinned: boolean;
  isDeleted: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ColorConfig {
  id: PastelColor;
  name: string;
  bgGradient: string;
  cardBorder: string;
  badgeBg: string;
  headerIconHover: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  swatchHex: string;
}

export const COLOR_CONFIGS: Record<PastelColor, ColorConfig> = {
  peach: {
    id: 'peach',
    name: 'Soft Peach',
    bgGradient: 'bg-gradient-to-b from-[#FEE8D6] to-[#FEDCC4]',
    cardBorder: 'border-[#F9CFB2]',
    badgeBg: 'bg-[#FAD8C3]',
    headerIconHover: 'hover:bg-amber-900/10',
    textPrimary: 'text-[#432311]',
    textSecondary: 'text-[#7D533A]',
    accent: '#E06D3B',
    swatchHex: '#FEE8D6',
  },
  amber: {
    id: 'amber',
    name: 'Warm Amber',
    bgGradient: 'bg-gradient-to-b from-[#FDE8C7] to-[#FCE0AC]',
    cardBorder: 'border-[#F6D090]',
    badgeBg: 'bg-[#F9DAA0]',
    headerIconHover: 'hover:bg-amber-900/10',
    textPrimary: 'text-[#422C08]',
    textSecondary: 'text-[#7B5922]',
    accent: '#D97706',
    swatchHex: '#FDE8C7',
  },
  lavender: {
    id: 'lavender',
    name: 'Soft Lavender',
    bgGradient: 'bg-gradient-to-b from-[#EAE4F8] to-[#DDD2F3]',
    cardBorder: 'border-[#D0C0ED]',
    badgeBg: 'bg-[#DCD0F2]',
    headerIconHover: 'hover:bg-purple-900/10',
    textPrimary: 'text-[#2D1B50]',
    textSecondary: 'text-[#68538E]',
    accent: '#7C3AED',
    swatchHex: '#EAE4F8',
  },
  mint: {
    id: 'mint',
    name: 'Soft Mint',
    bgGradient: 'bg-gradient-to-b from-[#D7F5E5] to-[#C3EED5]',
    cardBorder: 'border-[#ADE3C3]',
    badgeBg: 'bg-[#C6ECD6]',
    headerIconHover: 'hover:bg-emerald-900/10',
    textPrimary: 'text-[#0D4023]',
    textSecondary: 'text-[#30704D]',
    accent: '#059669',
    swatchHex: '#D7F5E5',
  },
  rose: {
    id: 'rose',
    name: 'Soft Rose',
    bgGradient: 'bg-gradient-to-b from-[#FDE0E6] to-[#FACFD9]',
    cardBorder: 'border-[#F4B6C6]',
    badgeBg: 'bg-[#F8C9D5]',
    headerIconHover: 'hover:bg-rose-900/10',
    textPrimary: 'text-[#4B1220]',
    textSecondary: 'text-[#874152]',
    accent: '#E11D48',
    swatchHex: '#FDE0E6',
  },
  sky: {
    id: 'sky',
    name: 'Soft Sky',
    bgGradient: 'bg-gradient-to-b from-[#DBECFA] to-[#C7E3F8]',
    cardBorder: 'border-[#B3D6F3]',
    badgeBg: 'bg-[#CBE4F8]',
    headerIconHover: 'hover:bg-sky-900/10',
    textPrimary: 'text-[#0C3457]',
    textSecondary: 'text-[#35658F]',
    accent: '#0284C7',
    swatchHex: '#DBECFA',
  },
  buttercup: {
    id: 'buttercup',
    name: 'Buttercup',
    bgGradient: 'bg-gradient-to-b from-[#FEF7D2] to-[#FDF0B5]',
    cardBorder: 'border-[#F6E18B]',
    badgeBg: 'bg-[#FCEBA2]',
    headerIconHover: 'hover:bg-yellow-900/10',
    textPrimary: 'text-[#3E3203]',
    textSecondary: 'text-[#746422]',
    accent: '#CA8A04',
    swatchHex: '#FEF7D2',
  },
  slate: {
    id: 'slate',
    name: 'Muted Cloud',
    bgGradient: 'bg-gradient-to-b from-[#F1F5F9] to-[#E2E8F0]',
    cardBorder: 'border-[#CBD5E1]',
    badgeBg: 'bg-[#E2E8F0]',
    headerIconHover: 'hover:bg-slate-900/10',
    textPrimary: 'text-[#1E293B]',
    textSecondary: 'text-[#475569]',
    accent: '#475569',
    swatchHex: '#F1F5F9',
  },
};
