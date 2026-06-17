import { useRef } from 'react';
import { FileText, Upload, X } from 'lucide-react';

interface UploadControlsProps {
  uploadedFile: File | null;
  setUploadedFile: (f: File | null) => void;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  isProcessing: boolean;
  hasConversation: boolean;
  canSummarize: boolean;
  isLoadingSummary: boolean;
  error: string | null;
  handleDrop: (e: React.DragEvent) => void;
  handleFileSelect: (file: File) => void;
  handleProcessFile: () => Promise<void>;
  handleSummaryClick: () => void;
}

export function UploadControls({
  uploadedFile,
  setUploadedFile,
  isDragging,
  setIsDragging,
  isProcessing,
  hasConversation,
  canSummarize,
  isLoadingSummary,
  error,
  handleDrop,
  handleFileSelect,
  handleProcessFile,
  handleSummaryClick,
}: UploadControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-4 w-full px-6">
      {!uploadedFile ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all ${
            isDragging
              ? 'border-[#5B5FF5] bg-[#EEF2FF]'
              : 'border-[#E5E7EB] hover:border-[#5B5FF5]/50 hover:bg-[#F9FAFB]'
          }`}
        >
          <Upload className="w-8 h-8 text-[#5B5FF5]" />
          <div className="text-center">
            <p className="text-sm font-medium text-[#1A1D2E]">오디오 파일 업로드</p>
            <p className="text-xs text-[#6B7280] mt-0.5">MP3, WAV, M4A, OGG 등 지원</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac,.aac"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="w-full bg-[#F3F4F6] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#5B5FF5]/10 flex items-center justify-center flex-shrink-0">
            <Upload className="w-5 h-5 text-[#5B5FF5]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1A1D2E] truncate">{uploadedFile.name}</p>
            <p className="text-xs text-[#6B7280]">{(uploadedFile.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
          <button
            onClick={() => setUploadedFile(null)}
            className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>
      )}

      <div className="flex gap-2 w-full">
        {uploadedFile && !hasConversation && (
          <button
            onClick={handleProcessFile}
            disabled={isProcessing}
            className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 text-sm transition-all ${
              isProcessing ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#5B5FF5] hover:bg-[#5B5FF5]/90 text-white'
            }`}
          >
            {isProcessing ? '분석 중...' : '파일 분석하기'}
          </button>
        )}
        <button
          onClick={handleSummaryClick}
          disabled={!canSummarize || isLoadingSummary}
          className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 text-sm transition-all ${
            canSummarize && !isLoadingSummary
              ? 'bg-[#22D3EE] hover:bg-[#22D3EE]/90 text-white cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <FileText className="w-4 h-4" />
          {isLoadingSummary ? '요약 중...' : '요약'}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 text-center w-full">{error}</p>
      )}
    </div>
  );
}
