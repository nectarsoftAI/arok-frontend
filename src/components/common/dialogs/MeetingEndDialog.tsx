import { LogOut, PenLine, RefreshCw, Download } from 'lucide-react';
import { DialogShell } from './DialogShell';
import { Button } from '../Button';

interface MeetingEndDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const FEATURES = [
  {
    icon: PenLine,
    label: '대화 수정 및 편집',
    desc: '녹음된 대화 내용을 직접 수정하고 편집할 수 있어요',
  },
  {
    icon: RefreshCw,
    label: '대화 재요약',
    desc: '편집된 내용을 바탕으로 요약을 다시 생성할 수 있어요',
  },
  {
    icon: Download,
    label: '요약 내보내기',
    desc: '회의 요약을 문서 파일로 저장하고 공유할 수 있어요',
  },
];

export function MeetingEndDialog({ isOpen, onConfirm, onClose }: MeetingEndDialogProps) {
  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      icon={<LogOut className="w-4 h-4 text-[#EF4444]" />}
      iconBg="bg-[#EF4444]/10"
      title="회의 종료"
    >
      <div className="p-6">
        <p className="text-sm font-medium text-[#1A1D2E] mb-1">
          회의를 종료하고 상세 화면으로 이동할까요?
        </p>
        <p className="text-xs text-[#6B7280] mb-5">
          상세 화면에서 다음 기능을 이용할 수 있어요
        </p>

        <div className="space-y-2.5 mb-6">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3 p-3.5 rounded-lg bg-[#F9FAFB]">
              <div className="w-7 h-7 rounded-md bg-[#5B5FF5]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-[#5B5FF5]" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#1A1D2E]">{label}</div>
                <div className="text-xs text-[#6B7280] mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            머무르기
          </Button>
          <Button variant="dark" onClick={onConfirm} className="flex-1">
            회의 종료하기
          </Button>
        </div>
      </div>
    </DialogShell>
  );
}
