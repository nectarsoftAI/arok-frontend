import { Check, Copy } from "lucide-react";
import linkIcon from "../../assets/icons/link_icon.webp";
import { Badge } from "../common/Badge";

interface MeetingInfoBarProps {
  title: string;
  startedAt: string | null;
  meetingLink: string;
  linkCopied: boolean;
  onCopyLink: () => void;
}

export function MeetingInfoBar({ title, startedAt, meetingLink, linkCopied, onCopyLink }: MeetingInfoBarProps) {
  return (
    <div className="flex-shrink-0 px-6 py-4 border-b border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-lg font-bold text-[#1A1D2E]">{title}</h1>
          <div className="flex items-center gap-2">
            {startedAt && <Badge variant="neutral" size="md">{startedAt}</Badge>}
            <Badge variant="primary" size="md">온라인 회의</Badge>
          </div>
        </div>
        <button
          onClick={onCopyLink}
          className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#5B5FF5] bg-[#F3F4F6] hover:bg-[#EEF2FF] rounded-lg px-3 py-1.5 transition-colors"
        >
          <img src={linkIcon} alt="" className="w-5 h-5 object-contain scale-125" />
          <span className="font-mono truncate max-w-[140px]">{meetingLink}</span>
          {linkCopied ? <Check className="w-3 h-3 text-[#5B5FF5]" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}
