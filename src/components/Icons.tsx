// Inline SVG icon set — zero external deps.
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const base = (size: number): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
})

export const HomeIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M3 12l9-9 9 9" /><path d="M5 10v10h14V10" /></svg>
)
export const BookIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z" /><path d="M4 19.5V22h16" /></svg>
)
export const DumbbellIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M6 6v12M18 6v12" /><rect x="3" y="8" width="3" height="8" rx="1" /><rect x="18" y="8" width="3" height="8" rx="1" /><path d="M6 12h12" /></svg>
)
export const ScrollIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M8 3h11a2 2 0 0 1 2 2v2" /><path d="M5 21h11a2 2 0 0 0 2-2V7H8a3 3 0 0 0-3 3v9a2 2 0 0 0 2 2z" /></svg>
)
export const ListIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
)
export const CogIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
)
export const FlameIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M12 2s4 5 4 9a4 4 0 0 1-8 0c0-2 2-4 2-6 0 0 0 3 2 3s2-3 0-6z" /></svg>
)
export const SpeakerIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M11 5 6 9H3v6h3l5 4V5z" /><path d="M19 5a8 8 0 0 1 0 14" /><path d="M15 9a4 4 0 0 1 0 6" /></svg>
)
export const CheckIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M20 6 9 17l-5-5" /></svg>
)
export const XIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M18 6L6 18M6 6l12 12" /></svg>
)
export const SparklesIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" /></svg>
)
export const ChevronRightIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="m9 18 6-6-6-6" /></svg>
)
export const ChevronLeftIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="m15 18-6-6 6-6" /></svg>
)
export const TrophyIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v5a5 5 0 0 1-10 0V4z" /><path d="M17 4h4v3a4 4 0 0 1-4 4M7 4H3v3a4 4 0 0 0 4 4" /></svg>
)
export const FinnishFlag = ({ size = 22, ...p }: IconProps) => (
  <svg width={size} height={size * 0.62} viewBox="0 0 180 110" {...p}>
    <rect width="180" height="110" fill="#fff" stroke="#ddd" />
    <rect x="54" y="0" width="24" height="110" fill="#003580" />
    <rect x="0" y="43" width="180" height="24" fill="#003580" />
  </svg>
)
export const ShuffleIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M16 3h5v5" /><path d="M4 20 21 3" /><path d="M21 16v5h-5" /><path d="M15 15l6 6" /><path d="M4 4l5 5" /></svg>
)
export const TargetIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
)
export const TrashIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
)
export const SearchIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
)
export const DownloadIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>
)
export const InfoIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
)
