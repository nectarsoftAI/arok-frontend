import { cn } from './utils';

export const SPEAKER_PALETTE = [
  '#5B5FF5', '#22D3EE', '#F59E0B', '#EC4899', '#10B981',
  '#EF4444', '#9b9b9b', '#A855F7', '#84CC16', '#b86314',
];

interface SpeakerAvatarProps {
  letter: string;
  colorClass?: string;  // Tailwind bg class e.g. "bg-[#5B5FF5]"
  color?: string;       // HEX color e.g. "#5B5FF5" (colorClass보다 우선)
  size?: 'sm' | 'md';  // sm = w-8 h-8, md = w-9 h-9 (default)
  bordered?: boolean;   // border-2 border-white (아바타 겹침 효과)
  speaking?: boolean;   // LiveKit 현재 발화자 표시 — 초록 링
  className?: string;
}

export function SpeakerAvatar({
  letter,
  colorClass,
  color,
  size = 'md',
  bordered = false,
  speaking = false,
  className,
}: SpeakerAvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 transition-shadow',
        size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm',
        bordered && 'border-2 border-white',
        speaking && 'ring-2 ring-[#22C55E] ring-offset-2',
        colorClass,
        className,
      )}
      style={color ? { backgroundColor: color } : undefined}
    >
      {letter}
    </div>
  );
}
