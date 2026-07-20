import { useState, useRef, useEffect } from 'react';
import { X, Check, Users, Loader2 } from 'lucide-react';
import { SpeakerAvatar } from './SpeakerAvatar';
import { Button } from './Button';
import { cn } from './utils';

export interface SpeakerRenameItem {
  /** 화자 고유 키 (예: SPEAKER_A) — 일괄 변경의 기준 */
  label: string;
  /** 아바타 기본 글자 — 보통 표시 이름의 첫 글자 */
  letter: string;
  /** 아바타 배경 HEX */
  color: string;
  /** 현재 표시 이름 */
  display: string;
}

interface SpeakerRenameDropdownProps {
  speakers: SpeakerRenameItem[];
  /** 변경된 화자만 { speakerLabel: 새 이름 } 형태로 전달. reject 시 패널이 열린 채 에러를 표시한다. */
  onApply: (renames: Record<string, string>) => Promise<void>;
  className?: string;
}

/** 트리거 버튼 + 드롭다운. 바깥 클릭/Esc 로 닫힌다. */
export function SpeakerRenameDropdown({ speakers, onApply, className }: SpeakerRenameDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className={cn('relative flex-shrink-0', className)}>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="flex items-center gap-1.5"
      >
        <Users className="w-3.5 h-3.5" />
        화자 편집
      </Button>
      {isOpen && (
        /* key: 열 때마다 입력값을 현재 표시 이름으로 초기화 */
        <SpeakerRenamePanel
          key={String(isOpen)}
          speakers={speakers}
          onApply={onApply}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

interface SpeakerRenamePanelProps {
  speakers: SpeakerRenameItem[];
  onApply: (renames: Record<string, string>) => Promise<void>;
  onClose: () => void;
}

function SpeakerRenamePanel({ speakers, onApply, onClose }: SpeakerRenamePanelProps) {
  const [names, setNames] = useState<Record<string, string>>(() =>
    Object.fromEntries(speakers.map((s) => [s.label, s.display]))
  );
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changed = speakers.filter((s) => names[s.label].trim() && names[s.label] !== s.display);

  const handleApply = async () => {
    if (changed.length === 0 || isApplying) return;
    setIsApplying(true);
    setError(null);
    try {
      await onApply(Object.fromEntries(changed.map((s) => [s.label, names[s.label].trim()])));
      onClose();
    } catch (err) {
      console.error('화자 이름 일괄 변경 실패', err);
      setError('변경에 실패했습니다. 다시 시도해 주세요.');
      setIsApplying(false);
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 z-30 w-72 bg-white rounded-lg border border-[#E5E7EB] shadow-lg">
      <div className="px-4 pt-3.5 pb-2 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[#1A1D2E]">화자 이름 일괄 수정</h3>
          <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
            수정 시 해당 화자의 모든 발화에 일괄 적용됩니다.
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="닫기"
          className="p-1 -m-1 rounded text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F3F4F6] transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-2 space-y-2.5 max-h-64 overflow-y-auto">
        {speakers.length === 0 ? (
          <p className="text-xs text-[#9CA3AF] py-2">화자 정보가 없습니다.</p>
        ) : (
          speakers.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              {/* 입력 중인 이름의 첫 글자를 즉시 반영 (비면 현재 이름 기준 글자) */}
              <SpeakerAvatar letter={names[s.label].trim().charAt(0) || s.letter} color={s.color} size="sm" />
              <span className="text-xs text-[#9CA3AF] truncate max-w-[4.5rem]" title={s.display}>
                {s.display}
              </span>
              <span className="text-xs text-[#D1D5DB] flex-shrink-0">→</span>
              <input
                value={names[s.label]}
                onChange={(e) => setNames((prev) => ({ ...prev, [s.label]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleApply(); }}
                placeholder={s.display}
                disabled={isApplying}
                className="flex-1 min-w-0 text-xs text-[#1A1D2E] bg-[#F9FAFB] border border-[#E5E7EB] rounded px-2 py-1.5 outline-none focus:border-[#5B5FF5] focus:bg-white transition-colors disabled:opacity-60"
              />
            </div>
          ))
        )}
      </div>

      {error && <p className="px-4 pb-1 text-xs text-red-500">{error}</p>}

      <div className="px-4 py-3 flex items-center gap-2 border-t border-[#F3F4F6]">
        <Button size="sm" variant="secondary" onClick={onClose} disabled={isApplying} className="flex-1">
          취소
        </Button>
        <Button
          size="sm"
          onClick={handleApply}
          disabled={changed.length === 0 || isApplying}
          className="flex-1 flex items-center justify-center gap-1.5"
        >
          {isApplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          적용
        </Button>
      </div>
    </div>
  );
}
