import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

export interface StepDef {
  label: string;
  content: React.ReactNode;
  actions?: React.ReactNode;
}

interface StepCardsProps {
  steps: StepDef[];
  onComplete?: () => void;
}

export function StepCards({ steps, onComplete }: StepCardsProps) {
  const [[currentStep, direction], setStepState] = useState<[number, number]>([0, 0]);

  const goTo = (next: number) => {
    if (next >= steps.length) {
      onComplete?.();
      return;
    }
    if (next === currentStep || next < 0) return;
    setStepState([next, next > currentStep ? 1 : -1]);
  };

  const isLastStep = currentStep === steps.length - 1;
  const totalItems = steps.length + (onComplete ? 1 : 0);

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">
      {/* Step indicator — outside the card */}
      <div className="flex items-center gap-2 px-1 flex-shrink-0">
        {Array.from({ length: totalItems }).map((_, i) => {
          const isEndStep = i === steps.length;
          const label = isEndStep ? '회의 종료' : steps[i].label;
          const isActive = !isEndStep && i === currentStep;
          const isDone = !isEndStep && i < currentStep;

          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isActive ? 'text-[#5B5FF5]' : 'text-[#9CA3AF] hover:text-[#6B7280]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                  isDone
                    ? 'bg-[#10B981] text-white'
                    : isActive
                    ? 'bg-[#5B5FF5] text-white'
                    : 'bg-[#E5E7EB] text-[#9CA3AF]'
                }`}
              >
                {isDone ? '✓' : i + 1}
              </span>
              {label}
              {i < totalItems - 1 && <ChevronRight className="w-3.5 h-3.5 text-[#D1D5DB] ml-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Card — fills remaining height */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col flex-1 min-h-0">
        {/* Card header: current step title + action buttons */}
        <div className="px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
          <h2 className="font-semibold text-[#1A1D2E]">{steps[currentStep].label}</h2>
          <div className="flex items-center gap-2">{steps[currentStep].actions}</div>
        </div>

        {/* Sliding content — overflow-hidden clips animation; inner div scrolls */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={SPRING}
              className="absolute inset-0 overflow-y-auto"
            >
              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom navigation — inside the card */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#E5E7EB] flex-shrink-0">
          <button
            onClick={() => goTo(currentStep - 1)}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#6B7280] hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            이전
          </button>

          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === currentStep ? 'w-5 bg-[#5B5FF5]' : 'w-1.5 bg-[#E5E7EB] hover:bg-[#9CA3AF]'
                }`}
              />
            ))}
          </div>

          {isLastStep && onComplete ? (
            <button
              onClick={onComplete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#EF4444] font-medium hover:bg-[#FEF2F2] transition-all"
            >
              종료
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => goTo(currentStep + 1)}
              disabled={isLastStep && !onComplete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#5B5FF5] font-medium hover:bg-[#EEF2FF] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
